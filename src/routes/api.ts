import { Hono } from "hono";
import type { Bindings } from "../types/env";
import { UserService } from "../services/user-service";

const api = new Hono<{ Bindings: Bindings }>();

api.get("/users", async (c) => {
  const service = new UserService(c.env.DB);
  const users = await service.list();
  return c.json({ users });
});

api.post("/users", async (c) => {
  const body = await c.req.json<{ name?: string; email?: string }>();

  if (!body.name || !body.email) {
    return c.json({ error: "name and email are required" }, 400);
  }

  const service = new UserService(c.env.DB);
  const user = await service.create({ name: body.name, email: body.email });
  return c.json({ user }, 201);
});

export default api;
