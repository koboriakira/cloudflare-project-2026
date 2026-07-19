import * as Sentry from "@sentry/cloudflare";
import type { ErrorHandler } from "hono";
import type { Bindings } from "../types/env";

export const errorHandler: ErrorHandler<{ Bindings: Bindings }> = (err, c) => {
  console.error(err);
  Sentry.captureException(err);

  return c.json({ error: "Internal Server Error" }, 500);
};
