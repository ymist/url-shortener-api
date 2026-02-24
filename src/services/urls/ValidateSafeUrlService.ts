import crypto from 'node:crypto';
import type { ICacheProvider } from '#src/cache/interfaces/ICacheProvider.js';
import type { ISafeUrlValidator } from '#src/services/urls/interfaces/ISafeUrlValidator.js';

const THREAT_TYPES = ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'];

const CACHE_TTL = 86400; // 24 hours

export class ValidateSafeUrlService implements ISafeUrlValidator {
	constructor(private cacheProvider: ICacheProvider) {}

	async isSafe(url: string): Promise<boolean> {
		const hash = crypto.createHash('sha256').update(url).digest('hex');
		const cacheKey = `safebrowsing:${hash}`;

		const cached = await this.cacheProvider.get(cacheKey);
		if (cached !== null) {
			return cached === '1';
		}

		const safe = await this.checkWithGoogleApi(url);
		await this.cacheProvider.set(cacheKey, safe ? '1' : '0', CACHE_TTL);
		return safe;
	}

	private async checkWithGoogleApi(url: string): Promise<boolean> {
		const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
		const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
		const payload = {
			client: { clientId: 'url-shortener-api', clientVersion: '1.0.0' },
			threatInfo: {
				threatTypes: THREAT_TYPES,
				platformTypes: ['ANY_PLATFORM'],
				threatEntryTypes: ['URL'],
				threatEntries: [{ url }],
			},
		};

		const response = await fetch(apiUrl, {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: { 'Content-Type': 'application/json' },
		});

		if (!response.ok) {
			throw new Error(`Google Safe Browsing API error: ${response.status}`);
		}

		const data = await response.json() as { matches?: unknown[] };

		// Se o objeto 'matches' existir, a URL é perigosa
		return !data.matches?.length;
	}
}
