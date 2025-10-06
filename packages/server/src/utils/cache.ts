import md5 from "md5";

// Cache storage
const cacheMap = new Map<string, { data: any; expires: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Cache middleware
export const cacheMiddleware = async (c: any, next: () => Promise<void>) => {
  const method = c.req.method;

  // Only cache POST requests
  if (method !== "POST") {
    await next();
    return;
  }

  // Try to parse JSON body for POST requests
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    await next();
    return;
  }

  if (!body.data) {
    await next();
    return;
  }

  const cacheKey = md5(`cache_${body.data}_${body.apiKey}`);
  const now = Date.now();

  // Check if cached data exists and is still valid
  const cached = cacheMap.get(cacheKey);
  if (cached && now < cached.expires) {
    // Return cached response
    return c.json(cached.data.data, cached.data.status);
  }

  // Clean up expired entries
  for (const [key, value] of cacheMap.entries()) {
    if (now >= value.expires) {
      cacheMap.delete(key);
    }
  }

  // Store original response method
  const originalJson = c.json.bind(c);

  // Override json method to cache the response
  c.json = (data: any, status?: number) => {
    // Cache the response
    cacheMap.set(cacheKey, {
      data: { data, status },
      expires: now + CACHE_DURATION,
    });

    // Return original response
    return originalJson(data, status);
  };

  await next();
};
