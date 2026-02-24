import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecordClickService } from '#src/services/analytics/RecordClickService';

vi.mock('#src/jobs/queues.js', () => ({
	analyticsQueue: {
		add: vi.fn().mockResolvedValue({ id: 'job-123' }),
	},
}));

describe('RecordClickService', () => {
	let recordClickService: RecordClickService;

	beforeEach(() => {
		vi.clearAllMocks();
		recordClickService = new RecordClickService();
	});

	it('Deve adicionar job na fila com dados completos', async () => {
		const { analyticsQueue } = await import('#src/jobs/queues.js');

		await recordClickService.execute({
			urlId: 'url-123',
			ip: '192.168.1.1',
			userAgent: 'Mozilla/5.0',
			referer: 'https://google.com',
		});

		expect(analyticsQueue.add).toHaveBeenCalledWith('record-click', {
			urlId: 'url-123',
			ip: '192.168.1.1',
			userAgent: 'Mozilla/5.0',
			referer: 'https://google.com',
		});
	});

	it('Deve adicionar job com valores null', async () => {
		const { analyticsQueue } = await import('#src/jobs/queues.js');

		await recordClickService.execute({
			urlId: 'url-123',
			ip: null,
			userAgent: null,
			referer: null,
		});

		expect(analyticsQueue.add).toHaveBeenCalledWith('record-click', {
			urlId: 'url-123',
			ip: null,
			userAgent: null,
			referer: null,
		});
	});

	it('Deve ser fire-and-forget (não bloquear)', async () => {
		const startTime = Date.now();

		await recordClickService.execute({
			urlId: 'url-123',
			ip: null,
			userAgent: null,
			referer: null,
		});

		const endTime = Date.now();
		expect(endTime - startTime).toBeLessThan(100);
	});
});
