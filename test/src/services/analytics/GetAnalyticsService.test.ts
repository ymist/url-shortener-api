import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { GetAnalyticsService } from '#src/services/analytics/GetAnalyticsService';
import { IUrlRepository } from '#src/repositories/interfaces/IUrlRepository';
import { IAnalyticsRepository } from '#src/repositories/interfaces/IAnalyticsRepository';

describe('GetAnalyticsService', () => {
	let getAnalyticsService: GetAnalyticsService;
	let mockUrlRepository: IUrlRepository;
	let mockAnalyticsRepository: IAnalyticsRepository;

	beforeEach(() => {
		mockUrlRepository = {
			create: vi.fn() as Mock,
			findByShortcode: vi.fn() as Mock,
		} as IUrlRepository;

		mockAnalyticsRepository = {
			create: vi.fn() as Mock,
			findByUrlId: vi.fn() as Mock,
		} as IAnalyticsRepository;

		getAnalyticsService = new GetAnalyticsService(
			mockUrlRepository,
			mockAnalyticsRepository
		);
	});

	it('Deve retornar analytics quando usuário é dono da URL', async () => {
		(mockUrlRepository.findByShortcode as Mock).mockResolvedValue({
			id: 'url-123',
			long_url: 'https://google.com',
			user_id: 'user-123',
		});

		(mockAnalyticsRepository.findByUrlId as Mock).mockResolvedValue({
			totalClicks: 150,
			clicksByDay: [{ date: '2024-01-15', count: 150 }],
			topReferers: ['google.com'],
		});

		const result = await getAnalyticsService.execute({
			shortcode: 'abc12',
			userId: 'user-123',
		});

		expect(result.shortcode).toBe('abc12');
		expect(result.totalClicks).toBe(150);
		expect(result.clicksByDay).toHaveLength(1);
		expect(result.topReferers).toContain('google.com');
	});

	it('Deve lançar erro quando URL não existe', async () => {
		(mockUrlRepository.findByShortcode as Mock).mockResolvedValue(null);

		await expect(
			getAnalyticsService.execute({
				shortcode: 'abc12',
				userId: 'user-123',
			})
		).rejects.toThrow('URL not found');
	});

	it('Deve lançar erro quando usuário não é dono da URL', async () => {
		(mockUrlRepository.findByShortcode as Mock).mockResolvedValue({
			id: 'url-123',
			long_url: 'https://google.com',
			user_id: 'other-user',
		});

		await expect(
			getAnalyticsService.execute({
				shortcode: 'abc12',
				userId: 'user-123',
			})
		).rejects.toThrow('Unauthorized');
	});

	it('Deve lançar erro para URL anônima (sem dono)', async () => {
		(mockUrlRepository.findByShortcode as Mock).mockResolvedValue({
			id: 'url-123',
			long_url: 'https://google.com',
			user_id: null,
		});

		await expect(
			getAnalyticsService.execute({
				shortcode: 'abc12',
				userId: 'user-123',
			})
		).rejects.toThrow('Unauthorized');
	});

	it('Deve buscar analytics pelo ID da URL', async () => {
		(mockUrlRepository.findByShortcode as Mock).mockResolvedValue({
			id: 'url-456',
			long_url: 'https://google.com',
			user_id: 'user-123',
		});

		(mockAnalyticsRepository.findByUrlId as Mock).mockResolvedValue({
			totalClicks: 0,
			clicksByDay: [],
			topReferers: [],
		});

		await getAnalyticsService.execute({
			shortcode: 'abc12',
			userId: 'user-123',
		});

		expect(mockAnalyticsRepository.findByUrlId).toHaveBeenCalledWith('url-456');
	});
});
