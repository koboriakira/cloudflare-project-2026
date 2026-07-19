import { Hono } from "hono";
import * as Sentry from "@sentry/cloudflare";
import type { Bindings } from "./types/env";
import health from "./routes/health";
import api from "./routes/api";
import { errorHandler } from "./middleware/error-handler";

const app = new Hono<{ Bindings: Bindings }>();

app.route("/health", health);
app.route("/api", api);

app.onError(errorHandler);

export default Sentry.withSentry(
  (env: Bindings) => ({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  }),
  app,
);
