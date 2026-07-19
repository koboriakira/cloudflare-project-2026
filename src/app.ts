import { OpenAPIHono } from "@hono/zod-openapi";
import { errorHandler } from "./middleware/error-handler";
import api from "./routes/api";
import health from "./routes/health";
import type { Bindings } from "./types/env";

const app = new OpenAPIHono<{ Bindings: Bindings }>();

app.route("/health", health);
app.route("/api", api);

app.onError(errorHandler);

export { app };
