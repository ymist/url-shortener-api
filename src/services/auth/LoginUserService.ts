import type { IUserRepository } from '#src/repositories/interfaces/IUserRepository.js';
import { comparePassword } from '#src/lib/bcrypt.js';
import { signToken } from '#src/lib/jwt.js';

interface LoginInput {
	email: string;
	password: string;
}

interface LoginOutput {
	user: {
		id: string;
		email: string;
		name: string | null;
	};
	token: string;
}

export class LoginUserService {
	constructor(private userRepository: IUserRepository) {}

	async execute(input: LoginInput): Promise<LoginOutput> {
		const user = await this.userRepository.findByEmail(input.email);

		if (!user) {
			throw new Error('Invalid credentials');
		}

		const passwordValid = await comparePassword(input.password, user.password);

		if (!passwordValid) {
			throw new Error('Invalid credentials');
		}

		const token = signToken({ userId: user.id, email: user.email });

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
			token,
		};
	}
}
