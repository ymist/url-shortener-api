import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ICacheProvider } from '#src/cache/interfaces/ICacheProvider';
import { IUrlRepository } from '#src/repositories/interfaces/IUrlRepository';
import { FindByShortCodeService } from '#src/services/urls/FindByShortCodeService';

describe('FindByShortCode Service', () => {
	let findByShortCode: FindByShortCodeService;
	let mockRepository: IUrlRepository;
	let mockCache: ICacheProvider;

	const mockUrlData = {
		id: 'uuid-123',
		long_url: 'https://google.com',
		user_id: null,
	};

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
		(mockCache.get as Mock).mockResolvedValue(JSON.stringify(mockUrlData));

		const result = await findByShortCode.execute('abc12');

		expect(result.long_url).toBe('https://google.com');
		expect(result.id).toBe('uuid-123');
		expect(mockCache.get).toHaveBeenCalledWith('url:abc12');
		expect(mockRepository.findByShortcode).not.toHaveBeenCalled();
	});

	it('Deve buscar no banco quando não existir no cache', async () => {
		(mockCache.get as Mock).mockResolvedValue(null);
		(mockRepository.findByShortcode as Mock).mockResolvedValue(mockUrlData);

		const result = await findByShortCode.execute('abc12');

		expect(result.long_url).toBe('https://google.com');
		expect(result.id).toBe('uuid-123');
		expect(mockRepository.findByShortcode).toHaveBeenCalledWith('abc12');
	});

	it('Deve salvar no cache após buscar do banco', async () => {
		(mockCache.get as Mock).mockResolvedValue(null);
		(mockRepository.findByShortcode as Mock).mockResolvedValue(mockUrlData);

		await findByShortCode.execute('abc12');

		expect(mockCache.set).toHaveBeenCalledWith(
			'url:abc12',
			JSON.stringify(mockUrlData),
			86400
		);
	});

	it('Deve renovar TTL do cache quando encontrar', async () => {
		const cachedData = JSON.stringify(mockUrlData);
		(mockCache.get as Mock).mockResolvedValue(cachedData);

		await findByShortCode.execute('abc12');

		expect(mockCache.set).toHaveBeenCalledWith('url:abc12', cachedData, 86400);
	});

	it('Deve lançar erro quando URL não existe', async () => {
		(mockCache.get as Mock).mockResolvedValue(null);
		(mockRepository.findByShortcode as Mock).mockResolvedValue(null);

		await expect(findByShortCode.execute('abc12')).rejects.toThrow('URL not found');
	});
});
