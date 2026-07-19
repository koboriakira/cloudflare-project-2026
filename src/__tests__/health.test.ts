import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("GET /health", () => {
	it("returns status ok with a timestamp", async () => {
		const res = await SELF.fetch("http://localhost/health");
		expect(res.status).toBe(200);

		const body = (await res.json()) as { status: string; timestamp: string };
		expect(body.status).toBe("ok");
		expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
	});
});
