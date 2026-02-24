import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ICacheProvider } from '#src/cache/interfaces/ICacheProvider';
import { IUrlRepository } from '#src/repositories/interfaces/IUrlRepository';
import { ISafeUrlValidator } from '#src/services/urls/interfaces/ISafeUrlValidator';
import { ShortenUrlService } from '#src/services/urls/ShortenUrlService';
import { generateSlug } from '#src/utils/generateSlug';

describe('ShortenUrlService Service', () => {
	let shortenUrlService: ShortenUrlService;
	let mockRepository: IUrlRepository;
	let mockCache: ICacheProvider;
	let mockValidator: ISafeUrlValidator;

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

		mockValidator = {
			isSafe: vi.fn() as Mock,
		} as ISafeUrlValidator;

		shortenUrlService = new ShortenUrlService(mockRepository, mockCache, mockValidator);
	});

	it('Deve usar o counter do cache para gerar o slug', async () => {
		(mockValidator.isSafe as Mock).mockResolvedValue(true);
		(mockCache.incr as Mock).mockResolvedValue(12122);
		(mockRepository.create as Mock).mockImplementation((data) => Promise.resolve(data));

		const result = await shortenUrlService.execute({ url: 'https://google.com' });

		expect(mockCache.incr).toHaveBeenCalledWith('url_counter');
		expect(result.shortcode).toBe(generateSlug(12122));
	});

	it('Deve salvar URL no repositório sem userId', async () => {
		(mockValidator.isSafe as Mock).mockResolvedValue(true);
		(mockCache.incr as Mock).mockResolvedValue(12122);
		(mockRepository.create as Mock).mockImplementation((data) => Promise.resolve(data));

		await shortenUrlService.execute({ url: 'https://google.com' });

		expect(mockRepository.create).toHaveBeenCalledWith({
			shortcode: expect.any(String),
			long_url: 'https://google.com',
			userId: undefined,
		});
	});

	it('Deve salvar URL no repositório com userId quando autenticado', async () => {
		(mockValidator.isSafe as Mock).mockResolvedValue(true);
		(mockCache.incr as Mock).mockResolvedValue(12122);
		(mockRepository.create as Mock).mockImplementation((data) => Promise.resolve(data));

		await shortenUrlService.execute({ url: 'https://google.com', userId: 'user-123' });

		expect(mockRepository.create).toHaveBeenCalledWith({
			shortcode: expect.any(String),
			long_url: 'https://google.com',
			userId: 'user-123',
		});
	});

	it('Deve retornar o shortcode gerado', async () => {
		(mockValidator.isSafe as Mock).mockResolvedValue(true);
		(mockCache.incr as Mock).mockResolvedValue(12122);
		(mockRepository.create as Mock).mockImplementation((data) => Promise.resolve(data));

		const result = await shortenUrlService.execute({ url: 'https://google.com' });

		expect(result).toHaveProperty('shortcode');
		expect(result.shortcode).not.toBe(12122);
		expect(typeof result.shortcode).toBe('string');
	});

	it('Deve rejeitar URL insegura antes de incrementar o counter', async () => {
		(mockValidator.isSafe as Mock).mockResolvedValue(false);

		await expect(shortenUrlService.execute({ url: 'http://malware.example.com' }))
			.rejects.toThrow('URL flagged as unsafe');

		expect(mockCache.incr).not.toHaveBeenCalled();
		expect(mockRepository.create).not.toHaveBeenCalled();
	});
});
