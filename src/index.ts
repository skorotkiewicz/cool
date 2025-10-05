import { promisify } from "node:util";
import { brotliCompress, brotliDecompress } from "node:zlib";
import { type Context, Hono } from "hono";
import { prisma } from "./prisma";
import { randomNameGenerator } from "./utils/nameGenerator";
import { rateLimiter } from "./utils/rateLimiter";

type Variables = {
	body: unknown;
	user: unknown; // Prisma User type
};

type IUser = {
	apiKey: string;
	isActive: boolean;
	data: string;
	randomName: string;
};

const compressAsync = promisify(brotliCompress);
const decompressAsync = promisify(brotliDecompress);

// User validation middleware
const userValidator = async (c: Context, next: () => Promise<void>) => {
	const body = c.get("body") as IUser;

	if (!body.apiKey) {
		return c.json({ error: "Missing apiKey" }, 400);
	}

	if (!body.randomName && !body.data) {
		return c.json({ error: "Missing randomName or data" }, 400);
	}

	// Check if user exists and is active, create if doesn't exist
	let user = await prisma.user.findUnique({
		where: { apiKey: body.apiKey },
	});

	if (!user) {
		// Create new user automatically
		user = await prisma.user.create({
			data: {
				apiKey: body.apiKey,
				isActive: true,
			},
		});
	}

	if (!user.isActive) {
		return c.json({ error: "User account is deactivated" }, 403);
	}

	// Pass user to context
	c.set("user", user);
	await next();
};

const app = new Hono<{ Variables: Variables }>();

// Middleware to parse JSON
app.use("*", async (c, next) => {
	if (c.req.method === "POST") {
		try {
			const body = await c.req.json();
			c.set("body", body);
		} catch {
			return c.json({ error: "Invalid JSON" }, 400);
		}
	}
	await next();
});

// Encode endpoint
app.post("/encode", rateLimiter, userValidator, async (c) => {
	try {
		const body = c.get("body") as IUser;
		const user = c.get("user") as IUser;

		// Compress data with Brotli
		const inputBuffer = Buffer.from(body.data, "utf8");

		let dataToStore: string;
		let isCompressed = false;

		try {
			const compressedData = await compressAsync(inputBuffer);
			if (compressedData.length < inputBuffer.length) {
				dataToStore = compressedData.toString("base64");
				isCompressed = true;
			} else {
				dataToStore = inputBuffer.toString("base64");
				isCompressed = false;
			}
		} catch (error) {
			console.log("Brotli compression failed, using original data:", error);
			dataToStore = inputBuffer.toString("base64");
			isCompressed = false;
		}

		// Generate unique random name
		const randomName = await randomNameGenerator();
		console.log("Random name generated:", randomName);

		// Store in database
		await prisma.encodedData.create({
			data: {
				randomName,
				apiKey: user.apiKey,
				data: dataToStore,
				compressed: isCompressed,
			},
		});

		return c.json({ success: true, randomName });
	} catch (error) {
		console.error("Encode error:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// Decode endpoint
app.post("/decode", rateLimiter, userValidator, async (c) => {
	try {
		const body = c.get("body") as { randomName: string };
		const user = c.get("user") as { apiKey: string };

		// Find data in database
		const encodedData = await prisma.encodedData.findUnique({
			where: { randomName: body.randomName },
		});

		if (!encodedData) {
			return c.json({ error: "Data not found" }, 404);
		}

		if (encodedData.apiKey !== user.apiKey) {
			return c.json({ error: "Invalid API key" }, 403);
		}

		// Decode from Base64 first
		const dataBuffer = Buffer.from(encodedData.data, "base64");

		let originalData: string;

		if (encodedData.compressed) {
			try {
				const decompressedData = await decompressAsync(dataBuffer);
				originalData = decompressedData.toString("utf8");
			} catch (decompError) {
				console.error("Decompression error:", decompError);
				originalData = dataBuffer.toString("utf8");
			}
		} else {
			originalData = dataBuffer.toString("utf8");
		}

		return c.json({ success: true, data: originalData });
	} catch (error) {
		console.error("Decode error:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

app.get("/", (c) => c.text("Cool Encoding Service"));

export default app;
