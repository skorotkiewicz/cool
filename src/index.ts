import { Hono } from "hono";
import { prisma } from "./prisma";

const app = new Hono();

app.get("/", (c) => c.text("Hono!"));

export default app;
