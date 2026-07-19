import { expect, test } from "@playwright/test";

test("GET /health returns ok status", async ({ request }) => {
  const res = await request.get("/health");
  expect(res.ok()).toBeTruthy();

  const body = await res.json();
  expect(body.status).toBe("ok");
  expect(body.timestamp).toBeTruthy();
});
