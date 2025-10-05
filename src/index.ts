import { compress, decompress } from "brotli";
import { Hono } from "hono";
import { prisma } from "./prisma";
import { randomNameGenerator } from "./utils/nameGenerator";

type Variables = {
	body: unknown;
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
app.post("/encode", async (c) => {
	try {
		const body = c.get("body") as { data: string; apiKey: string };
		const { data, apiKey } = body;

		if (!data || !apiKey) {
			return c.json({ error: "Missing data or apiKey" }, 400);
		}

		// For now, let's just store the data directly as string
		console.log("Storing data directly...");
		const dataToStore = data;

		// Generate unique random name
		console.log("Generating random name...");
		const randomName = await randomNameGenerator();
		console.log("Random name generated:", randomName);

		// Store in database
		console.log("Storing in database...");
		console.log("Data type:", typeof dataToStore);

		await prisma.encodedData.create({
			data: {
				randomName,
				apiKey,
				data: dataToStore,
			},
		});
		console.log("Data stored successfully");

		return c.json({
			success: true,
			randomName: `cool-${randomName}`,
		});
	} catch (error) {
		console.error("Encode error:", error);
		console.error("Error details:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// Decode endpoint
app.post("/decode", async (c) => {
	try {
		const body = c.get("body") as { randomName: string; apiKey: string };
		const { randomName, apiKey } = body;

		if (!randomName || !apiKey) {
			return c.json({ error: "Missing randomName or apiKey" }, 400);
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

		// Return the data directly
		console.log("Returning data directly:", encodedData.data);
		const originalData = encodedData.data;

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
