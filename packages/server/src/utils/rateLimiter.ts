import type { Context } from "hono";

// Rate limiter storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

// Rate limiter middleware
export const rateLimiter = async (c: Context, next: () => Promise<void>) => {
  const clientIP =
    c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || c.env?.ip || "unknown";

  const now = Date.now();
  const key = `rate_limit_${clientIP}`;

  // Clean up expired entries
  for (const [k, v] of rateLimitMap.entries()) {
    if (now > v.resetTime) {
      rateLimitMap.delete(k);
    }
  }

  // Get or create rate limit entry
  let entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    rateLimitMap.set(key, entry);
  }

  // Check if limit exceeded
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return c.json(
      {
        error: "Rate limit exceeded",
        message: `Maximum ${RATE_LIMIT_MAX_REQUESTS} requests per minute allowed`,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      },
      429,
    );
  }

  // Increment counter
  entry.count++;

  await next();
};
