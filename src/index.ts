import * as Sentry from "@sentry/cloudflare";
import { app } from "./app";
import type { Bindings } from "./types/env";

export default Sentry.withSentry(
	(env: Bindings) => ({
		dsn: env.SENTRY_DSN,
		tracesSampleRate: 1.0,
	}),
	app,
);

export { app };
