import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { LoginUserService } from '#src/services/auth/LoginUserService';
import { IUserRepository } from '#src/repositories/interfaces/IUserRepository';

vi.mock('#src/lib/bcrypt.js', () => ({
	comparePassword: vi.fn(),
}));

vi.mock('#src/lib/jwt.js', () => ({
	signToken: vi.fn().mockReturnValue('jwt-token-123'),
}));

describe('LoginUserService', () => {
	let loginUserService: LoginUserService;
	let mockUserRepository: IUserRepository;

	beforeEach(() => {
		vi.clearAllMocks();

		mockUserRepository = {
			create: vi.fn() as Mock,
			findByEmail: vi.fn() as Mock,
			findById: vi.fn() as Mock,
		} as IUserRepository;

		loginUserService = new LoginUserService(mockUserRepository);
	});

	it('Deve fazer login com sucesso', async () => {
		const { comparePassword } = await import('#src/lib/bcrypt.js');
		(comparePassword as Mock).mockResolvedValue(true);

		(mockUserRepository.findByEmail as Mock).mockResolvedValue({
			id: 'user-123',
			email: 'test@email.com',
			password: 'hashed-password',
			name: 'Test User',
		});

		const result = await loginUserService.execute({
			email: 'test@email.com',
			password: '123456',
		});

		expect(result.user.email).toBe('test@email.com');
		expect(result.user.name).toBe('Test User');
		expect(result.token).toBe('jwt-token-123');
	});

	it('Deve lançar erro se usuário não existe', async () => {
		(mockUserRepository.findByEmail as Mock).mockResolvedValue(null);

		await expect(
			loginUserService.execute({
				email: 'nonexistent@email.com',
				password: '123456',
			})
		).rejects.toThrow('Invalid credentials');
	});

	it('Deve lançar erro se senha estiver incorreta', async () => {
		const { comparePassword } = await import('#src/lib/bcrypt.js');
		(comparePassword as Mock).mockResolvedValue(false);

		(mockUserRepository.findByEmail as Mock).mockResolvedValue({
			id: 'user-123',
			email: 'test@email.com',
			password: 'hashed-password',
			name: 'Test User',
		});

		await expect(
			loginUserService.execute({
				email: 'test@email.com',
				password: 'wrong-password',
			})
		).rejects.toThrow('Invalid credentials');
	});

	it('Não deve expor hash da senha no retorno', async () => {
		const { comparePassword } = await import('#src/lib/bcrypt.js');
		(comparePassword as Mock).mockResolvedValue(true);

		(mockUserRepository.findByEmail as Mock).mockResolvedValue({
			id: 'user-123',
			email: 'test@email.com',
			password: 'hashed-password',
			name: 'Test User',
		});

		const result = await loginUserService.execute({
			email: 'test@email.com',
			password: '123456',
		});

		expect(result.user).not.toHaveProperty('password');
	});
});
