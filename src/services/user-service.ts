export type User = {
	id: string;
	name: string;
	email: string;
	created_at: string;
};

export type CreateUserInput = {
	name: string;
	email: string;
};

export class UserService {
	constructor(private readonly db: D1Database) {}

	async list(): Promise<User[]> {
		const { results } = await this.db
			.prepare("SELECT id, name, email, created_at FROM users ORDER BY created_at DESC")
			.all<User>();
		return results;
	}

	async create(input: CreateUserInput): Promise<User> {
		const id = crypto.randomUUID();
		const createdAt = new Date().toISOString();

		await this.db
			.prepare("INSERT INTO users (id, name, email, created_at) VALUES (?, ?, ?, ?)")
			.bind(id, input.name, input.email, createdAt)
			.run();

		return { id, name: input.name, email: input.email, created_at: createdAt };
	}
}
