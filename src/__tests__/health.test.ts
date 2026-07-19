import { describe, expect, it } from "vitest";
import health from "../routes/health";

describe("GET /health", () => {
  it("returns status ok with a timestamp", async () => {
    const res = await health.request("/");

    expect(res.status).toBe(200);

    const body = await res.json<{ status: string; timestamp: string }>();
    expect(body.status).toBe("ok");
    expect(typeof body.timestamp).toBe("string");
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });
});
