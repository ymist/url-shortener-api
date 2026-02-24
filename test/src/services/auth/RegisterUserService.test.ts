import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { RegisterUserService } from '#src/services/auth/RegisterUserService';
import { IUserRepository } from '#src/repositories/interfaces/IUserRepository';

vi.mock('#src/lib/bcrypt.js', () => ({
	hashPassword: vi.fn().mockResolvedValue('hashed-password'),
}));

vi.mock('#src/lib/jwt.js', () => ({
	signToken: vi.fn().mockReturnValue('jwt-token-123'),
}));

describe('RegisterUserService', () => {
	let registerUserService: RegisterUserService;
	let mockUserRepository: IUserRepository;

	beforeEach(() => {
		mockUserRepository = {
			create: vi.fn() as Mock,
			findByEmail: vi.fn() as Mock,
			findById: vi.fn() as Mock,
		} as IUserRepository;

		registerUserService = new RegisterUserService(mockUserRepository);
	});

	it('Deve registrar usuário com sucesso', async () => {
		(mockUserRepository.findByEmail as Mock).mockResolvedValue(null);
		(mockUserRepository.create as Mock).mockResolvedValue({
			id: 'user-123',
			email: 'test@email.com',
			name: 'Test User',
		});

		const result = await registerUserService.execute({
			email: 'test@email.com',
			password: '123456',
			name: 'Test User',
		});

		expect(result.user.email).toBe('test@email.com');
		expect(result.token).toBe('jwt-token-123');
	});

	it('Deve lançar erro se email já existe', async () => {
		(mockUserRepository.findByEmail as Mock).mockResolvedValue({
			id: 'existing-user',
			email: 'test@email.com',
			password: 'hash',
			name: 'Existing',
		});

		await expect(
			registerUserService.execute({
				email: 'test@email.com',
				password: '123456',
			})
		).rejects.toThrow('Email already registered');
	});

	it('Deve fazer hash da senha antes de salvar', async () => {
		const { hashPassword } = await import('#src/lib/bcrypt.js');
		(mockUserRepository.findByEmail as Mock).mockResolvedValue(null);
		(mockUserRepository.create as Mock).mockResolvedValue({
			id: 'user-123',
			email: 'test@email.com',
			name: null,
		});

		await registerUserService.execute({
			email: 'test@email.com',
			password: 'my-password',
		});

		expect(hashPassword).toHaveBeenCalledWith('my-password');
		expect(mockUserRepository.create).toHaveBeenCalledWith({
			email: 'test@email.com',
			password: 'hashed-password',
			name: undefined,
		});
	});

	it('Deve registrar usuário sem nome', async () => {
		(mockUserRepository.findByEmail as Mock).mockResolvedValue(null);
		(mockUserRepository.create as Mock).mockResolvedValue({
			id: 'user-123',
			email: 'test@email.com',
			name: null,
		});

		const result = await registerUserService.execute({
			email: 'test@email.com',
			password: '123456',
		});

		expect(result.user.name).toBeNull();
	});
});
