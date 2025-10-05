import { promisify } from "node:util";
import { brotliCompress, brotliDecompress } from "node:zlib";
import { Hono } from "hono";
import { prisma } from "./prisma";
import { randomNameGenerator } from "./utils/nameGenerator";
import { rateLimiter } from "./utils/rateLimiter";

type Variables = {
	body: unknown;
};

const compressAsync = promisify(brotliCompress);
const decompressAsync = promisify(brotliDecompress);

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
app.post("/encode", rateLimiter, async (c) => {
	try {
		const body = c.get("body") as { data: string; apiKey: string };
		const { data, apiKey } = body;

		if (!data || !apiKey) {
			return c.json({ error: "Missing data or apiKey" }, 400);
		}

		// Check if user exists and is active, create if doesn't exist
		let user = await prisma.user.findUnique({
			where: { apiKey },
		});

		if (!user) {
			// Create new user automatically
			user = await prisma.user.create({
				data: {
					apiKey,
					isActive: true,
				},
			});
		}

		if (!user.isActive) {
			return c.json({ error: "User account is deactivated" }, 403);
		}

		// Compress data with Brotli
		const inputBuffer = Buffer.from(data, "utf8");

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
				apiKey,
				data: dataToStore,
				compressed: isCompressed,
				userId: user.id,
			},
		});

		return c.json({
			success: true,
			randomName: `cool-${randomName}`,
		});
	} catch (error) {
		console.error("Encode error:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// Decode endpoint
app.post("/decode", rateLimiter, async (c) => {
	try {
		const body = c.get("body") as { randomName: string; apiKey: string };
		const { randomName, apiKey } = body;

		if (!randomName || !apiKey) {
			return c.json({ error: "Missing randomName or apiKey" }, 400);
		}

		// Check if user exists and is active
		const user = await prisma.user.findUnique({
			where: { apiKey },
		});

		if (!user?.isActive) {
			return c.json({ error: "User account is deactivated" }, 403);
		}

		// Remove "cool-" prefix if present
		const cleanName = randomName.startsWith("cool-")
			? randomName.slice(5)
			: randomName;

		// Find data in database
		const encodedData = await prisma.encodedData.findUnique({
			where: { randomName: cleanName },
		});

		if (!encodedData) {
			return c.json({ error: "Data not found" }, 404);
		}

		if (encodedData.apiKey !== apiKey) {
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
			// Data is not compressed, use directly
			console.log("Data not compressed, using directly");
			originalData = dataBuffer.toString("utf8");
		}

		return c.json({
			success: true,
			data: originalData,
		});
	} catch (error) {
		console.error("Decode error:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

app.get("/", (c) => c.text("Cool Encoding Service"));

export default app;
