import type { Context } from "hono";
import { prisma } from "../prisma";

export type IUser = {
  apiKey: string;
  isActive: boolean;
  data: string;
  randomName: string;
};

// User validation middleware
export const userValidator = async (c: Context, next: () => Promise<void>) => {
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
