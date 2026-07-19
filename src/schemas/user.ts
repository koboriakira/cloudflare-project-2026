import { z } from "@hono/zod-openapi";

export const UserSchema = z
	.object({
		id: z.string().uuid(),
		name: z.string().min(1),
		email: z.string().email(),
		created_at: z.string().datetime(),
	})
	.openapi("User");

export const CreateUserInputSchema = z
	.object({
		name: z.string().min(1),
		email: z.string().email(),
	})
	.openapi("CreateUserInput");
