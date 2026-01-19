import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ICacheProvider } from '../../../src/cache/interfaces/ICacheProvider.js';
import { IUrlRepository } from '../../../src/repositories/interfaces/IUrlRepository.js';
import { ShortenUrlService } from '../../../src/services/urls/ShortenUrlService.js';
import { generateSlug } from '../../../src/utils/generateSlug.js';

describe('ShortenUrlService Service', () => {
	let shortenUrlService: ShortenUrlService;
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

		shortenUrlService = new ShortenUrlService(mockRepository, mockCache);
	});
	it('Deve usar o counter do cache para gerar o slug', async () => {
		(mockCache.incr as Mock).mockResolvedValue(12122);
		(mockRepository.create as Mock).mockImplementation((data) => Promise.resolve(data));

		const result = await shortenUrlService.execute('https://google.com');

		expect(mockCache.incr).toHaveBeenCalledWith('url_counter');
		expect(result.shortcode).toBe(generateSlug(12122));
	});
	it('Deve salvar URL no repositório', async () => {
		(mockCache.incr as Mock).mockResolvedValue(12122);
		(mockRepository.create as Mock).mockImplementation((data) => {
			return Promise.resolve(data);
		});
		await shortenUrlService.execute(`https://google.com`);
		expect(mockRepository.create).toHaveBeenCalledWith({
			shortcode: expect.any(String),
			long_url: 'https://google.com',
		});
	});
	it('Deve retornar o shortcode gerado', async () => {
		(mockCache.incr as Mock).mockResolvedValue(12122);
		(mockRepository.create as Mock).mockImplementation((data) => {
			return Promise.resolve(data);
		});

		const result = await shortenUrlService.execute(`https://google.com`);

		expect(result).toHaveProperty('shortcode');
		expect(result.shortcode).not.toBe(12122);
		expect(typeof result.shortcode).toBe(`string`);
	});
});
