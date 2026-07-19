import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { ErrorSchema } from "../schemas/common";
import { CreateUserInputSchema, UserSchema } from "../schemas/user";
import { UserService } from "../services/user-service";
import type { Bindings } from "../types/env";

const api = new OpenAPIHono<{ Bindings: Bindings }>();

const listUsersRoute = createRoute({
	method: "get",
	path: "/users",
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.object({ users: z.array(UserSchema) }),
				},
			},
			description: "List all users",
		},
	},
});

const createUserRoute = createRoute({
	method: "post",
	path: "/users",
	request: {
		body: {
			content: {
				"application/json": {
					schema: CreateUserInputSchema,
				},
			},
		},
	},
	responses: {
		201: {
			content: {
				"application/json": {
					schema: z.object({ user: UserSchema }),
				},
			},
			description: "User created",
		},
		400: {
			content: {
				"application/json": {
					schema: ErrorSchema,
				},
			},
			description: "Validation error",
		},
	},
});

api.openapi(listUsersRoute, async (c) => {
	const service = new UserService(c.env.DB);
	const users = await service.list();
	return c.json({ users }, 200);
});

api.openapi(createUserRoute, async (c) => {
	const body = c.req.valid("json");
	const service = new UserService(c.env.DB);
	const user = await service.create(body);
	return c.json({ user }, 201);
});

export default api;
