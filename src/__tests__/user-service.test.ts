import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserService } from "../services/user-service";

function createMockDb() {
  const users: Array<{ id: string; name: string; email: string; created_at: string }> = [];

  const statement = {
    bind: vi.fn(function (this: unknown, ...args: [string, string, string, string]) {
      users.push({ id: args[0], name: args[1], email: args[2], created_at: args[3] });
      return statement;
    }),
    run: vi.fn(async () => ({ success: true })),
    all: vi.fn(async () => ({ results: users })),
  };

  const db = {
    prepare: vi.fn(() => statement),
  } as unknown as D1Database;

  return { db, users };
}

describe("UserService", () => {
  let mock: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mock = createMockDb();
  });

  it("creates a user and returns it", async () => {
    const service = new UserService(mock.db);
    const user = await service.create({ name: "Taro", email: "taro@example.com" });

    expect(user.name).toBe("Taro");
    expect(user.email).toBe("taro@example.com");
    expect(user.id).toBeTruthy();
    expect(user.created_at).toBeTruthy();
  });

  it("lists created users", async () => {
    const service = new UserService(mock.db);
    await service.create({ name: "Taro", email: "taro@example.com" });

    const users = await service.list();
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe("Taro");
  });
});
