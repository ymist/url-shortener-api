import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { FindByShortCodeService } from '../../../src/services/urls/FindByShortCodeService.js';
import { IUrlRepository } from '../../../src/repositories/interfaces/IUrlRepository.js';
import { ICacheProvider } from '../../../src/cache/interfaces/ICacheProvider.js';

describe('FindByShortCode Service', () => {
	let findByShortCode: FindByShortCodeService;
	let mockRepository: IUrlRepository;
	let mockCache: ICacheProvider;

	beforeEach(() => {
		mockRepository = {
			findByShortcode: vi.fn() as Mock,
			create: vi.fn() as Mock,
		} as IUrlRepository;

		mockCache = {
			get: vi.fn() as Mock,
			set: vi.fn() as Mock,
			incr: vi.fn() as Mock,
		} as ICacheProvider;

		findByShortCode = new FindByShortCodeService(mockRepository, mockCache);
	});

	it('Deve retornar URL do cache quando existir', async () => {
		// Arrange
		(mockCache.get as Mock).mockResolvedValue('https://google.com');

		// Act
		const result = await findByShortCode.execute('abc123');

		// Assert
		expect(result.long_url).toBe('https://google.com');
		expect(mockCache.get).toHaveBeenCalledWith('url:abc123');
		expect(mockRepository.findByShortcode).not.toHaveBeenCalled(); // não deve buscar no banco
	});

	it('Deve buscar no banco quando não existir no cache', async () => {
		// TODO: você implementa esse
		(mockCache.get as Mock).mockResolvedValue(null);

		// Repository retorna objeto completo
		(mockRepository.findByShortcode as Mock).mockResolvedValue({
			id: 'uuid-123',
			shortcode: 'abc123',
			long_url: 'https://google.com',
			created_at: new Date(),
		});

		const result = await findByShortCode.execute('abc123');

		expect(result.long_url).toBe('https://google.com');
		expect(mockRepository.findByShortcode).toHaveBeenCalledWith('abc123');
	});

	it('Deve salvar no cache após buscar do banco', async () => {
		(mockCache.get as Mock).mockResolvedValue(null);

		// Repository retorna objeto completo
		(mockRepository.findByShortcode as Mock).mockResolvedValue({
			id: 'uuid-123',
			shortcode: 'abc123',
			long_url: 'https://google.com',
			created_at: new Date(),
		});

		const result = await findByShortCode.execute('abc123');

		expect(mockCache.set).toHaveBeenCalledWith(`url:abc123`, result.long_url, 86400);
	});

	it('Deve lançar erro quando URL não existe', async () => {
		(mockCache.get as Mock).mockResolvedValue(null);
		(mockRepository.findByShortcode as Mock).mockResolvedValue(null);
		expect(findByShortCode.execute('abc123')).rejects.toThrow('URL not found');
	});
});
