import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { Bindings } from "../types/env";

const health = new OpenAPIHono<{ Bindings: Bindings }>();

const healthRoute = createRoute({
	method: "get",
	path: "/",
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.object({
						status: z.literal("ok"),
						timestamp: z.string().datetime(),
					}),
				},
			},
			description: "Health check",
		},
	},
});

health.openapi(healthRoute, (c) => {
	return c.json({ status: "ok" as const, timestamp: new Date().toISOString() }, 200);
});

export default health;
