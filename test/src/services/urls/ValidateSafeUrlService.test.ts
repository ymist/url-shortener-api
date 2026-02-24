import { describe, it, expect, beforeEach, vi, Mock, afterEach } from 'vitest';
import { ICacheProvider } from '#src/cache/interfaces/ICacheProvider';
import { ValidateSafeUrlService } from '#src/services/urls/ValidateSafeUrlService';

const TEST_URL = 'https://example.com';

describe('ValidateSafeUrlService', () => {
	let mockCache: ICacheProvider;
	let service: ValidateSafeUrlService;

	beforeEach(() => {
		mockCache = {
			get: vi.fn() as Mock,
			set: vi.fn() as Mock,
			incr: vi.fn() as Mock,
		} as ICacheProvider;

		service = new ValidateSafeUrlService(mockCache);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('Deve retornar true quando cache indica URL segura', async () => {
		(mockCache.get as Mock).mockResolvedValue('1');

		const result = await service.isSafe(TEST_URL);

		expect(result).toBe(true);
		expect(mockCache.get).toHaveBeenCalledOnce();
		expect(mockCache.set).not.toHaveBeenCalled();
	});

	it('Deve retornar false quando cache indica URL insegura', async () => {
		(mockCache.get as Mock).mockResolvedValue('0');

		const result = await service.isSafe(TEST_URL);

		expect(result).toBe(false);
		expect(mockCache.get).toHaveBeenCalledOnce();
		expect(mockCache.set).not.toHaveBeenCalled();
	});

	it('Deve chamar a API e retornar true quando URL é segura (sem matches)', async () => {
		(mockCache.get as Mock).mockResolvedValue(null);
		(mockCache.set as Mock).mockResolvedValue(undefined);
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({}),
		}));

		const result = await service.isSafe(TEST_URL);

		expect(result).toBe(true);
		expect(mockCache.set).toHaveBeenCalledWith(
			expect.stringMatching(/^safebrowsing:/),
			'1',
			86400,
		);
	});

	it('Deve chamar a API e retornar false quando URL está na lista negra', async () => {
		(mockCache.get as Mock).mockResolvedValue(null);
		(mockCache.set as Mock).mockResolvedValue(undefined);
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({ matches: [{ threatType: 'MALWARE' }] }),
		}));

		const result = await service.isSafe(TEST_URL);

		expect(result).toBe(false);
		expect(mockCache.set).toHaveBeenCalledWith(
			expect.stringMatching(/^safebrowsing:/),
			'0',
			86400,
		);
	});

	it('Deve lançar erro quando a API retorna status de erro (fail-closed)', async () => {
		(mockCache.get as Mock).mockResolvedValue(null);
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
			ok: false,
			status: 403,
			json: vi.fn(),
		}));

		await expect(service.isSafe(TEST_URL)).rejects.toThrow('Google Safe Browsing API error: 403');
		expect(mockCache.set).not.toHaveBeenCalled();
	});

	it('Deve lançar erro em falha de rede (fail-closed)', async () => {
		(mockCache.get as Mock).mockResolvedValue(null);
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

		await expect(service.isSafe(TEST_URL)).rejects.toThrow('Network error');
		expect(mockCache.set).not.toHaveBeenCalled();
	});
});
