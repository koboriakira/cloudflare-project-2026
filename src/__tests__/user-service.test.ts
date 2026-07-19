import { SELF, env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";

describe("POST /api/users", () => {
	beforeEach(async () => {
		await env.DB.exec(
			"CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, created_at TEXT NOT NULL)",
		);
		await env.DB.exec("DELETE FROM users");
	});

	it("creates a user with valid input", async () => {
		const res = await SELF.fetch("http://localhost/api/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "Taro", email: "taro@example.com" }),
		});

		expect(res.status).toBe(201);
		const body = (await res.json()) as { user: { id: string; name: string; email: string } };
		expect(body.user.name).toBe("Taro");
		expect(body.user.email).toBe("taro@example.com");
		expect(body.user.id).toBeTruthy();
	});

	it("returns 400 for invalid input", async () => {
		const res = await SELF.fetch("http://localhost/api/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "" }),
		});

		expect(res.status).toBe(400);
	});
});

describe("GET /api/users", () => {
	beforeEach(async () => {
		await env.DB.exec(
			"CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, created_at TEXT NOT NULL)",
		);
		await env.DB.exec("DELETE FROM users");
	});

	it("returns empty array when no users exist", async () => {
		const res = await SELF.fetch("http://localhost/api/users");
		expect(res.status).toBe(200);

		const body = (await res.json()) as { users: unknown[] };
		expect(body.users).toHaveLength(0);
	});

	it("returns created users", async () => {
		await SELF.fetch("http://localhost/api/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "Taro", email: "taro@example.com" }),
		});

		const res = await SELF.fetch("http://localhost/api/users");
		expect(res.status).toBe(200);

		const body = (await res.json()) as { users: { name: string }[] };
		expect(body.users).toHaveLength(1);
		expect(body.users[0].name).toBe("Taro");
	});
});
