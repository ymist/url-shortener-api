import type { IUserRepository } from '#src/repositories/interfaces/IUserRepository.js';
import { hashPassword } from '#src/lib/bcrypt.js';
import { signToken } from '#src/lib/jwt.js';

interface RegisterInput {
	email: string;
	password: string;
	name?: string;
}

interface RegisterOutput {
	user: {
		id: string;
		email: string;
		name: string | null;
	};
	token: string;
}

export class RegisterUserService {
	constructor(private userRepository: IUserRepository) {}

	async execute(input: RegisterInput): Promise<RegisterOutput> {
		const existingUser = await this.userRepository.findByEmail(input.email);

		if (existingUser) {
			throw new Error('Email already registered');
		}

		const passwordHash = await hashPassword(input.password);

		const user = await this.userRepository.create({
			email: input.email,
			password: passwordHash,
			name: input.name,
		});

		const token = signToken({ userId: user.id, email: user.email });

		return { user, token };
	}
}
