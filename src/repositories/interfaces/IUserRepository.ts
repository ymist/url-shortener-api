export interface IUserRepository {
	create(data: {
		email: string;
		password: string;
		name?: string;
	}): Promise<{ id: string; email: string; name: string | null }>;
	findByEmail(email: string): Promise<{
		id: string;
		email: string;
		password: string;
		name: string | null;
	} | null>;
	findById(id: string): Promise<{
		id: string;
		email: string;
		name: string | null;
	} | null>;
}
