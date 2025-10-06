import { promisify } from "node:util";
import { brotliCompress, brotliDecompress } from "node:zlib";
import { Hono } from "hono";
import { prisma } from "./prisma";
import { cacheMiddleware } from "./utils/cache";
import { randomNameGenerator } from "./utils/nameGenerator";
import { rateLimiter } from "./utils/rateLimiter";
import { type IUser, userValidator } from "./utils/userValidator";

type Variables = {
  body: unknown;
  user: unknown;
};

const compressAsync = promisify(brotliCompress);
const decompressAsync = promisify(brotliDecompress);

const app = new Hono<{ Variables: Variables }>();

// Cache middleware for all requests
app.use("*", cacheMiddleware);

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
    const body = c.get("body") as IUser;
    const user = c.get("user") as IUser;

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

// Service info endpoint
app.get("/info", (c) => {
  return c.json({
    service: "Cool Encoding Service",
    version: "1.0.0",
    features: ["Brotli Compression", "User Management", "Rate Limiting", "Caching"],
    endpoints: {
      encode: "POST /encode",
      decode: "POST /decode",
      info: "GET /info",
    },
    cache: {
      duration: "1 hour",
      appliesTo: "POST requests",
    },
  });
});

export default app;
