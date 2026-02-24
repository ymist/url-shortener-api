import type { ICacheProvider } from '#src/cache/interfaces/ICacheProvider.js';
import type { IUrlRepository } from '#src/repositories/interfaces/IUrlRepository.js';

interface UrlData {
	id: string;
	long_url: string;
	user_id: string | null;
}

export class FindByShortCodeService {
	constructor(
		private urlRepository: IUrlRepository,
		private cacheProvider: ICacheProvider,
	) {}

	async execute(shortcode: string): Promise<UrlData> {
		const cached = await this.cacheProvider.get(`url:${shortcode}`);

		if (cached) {
			await this.cacheProvider.set(`url:${shortcode}`, cached, 86400);
			return JSON.parse(cached) as UrlData;
		}

		const urlData = await this.urlRepository.findByShortcode(shortcode);

		if (!urlData) {
			const err = new Error('URL not found');
			(err as Error & { statusCode: number }).statusCode = 404;
			throw err;
		}

		await this.cacheProvider.set(`url:${shortcode}`, JSON.stringify(urlData), 86400);

		return urlData;
	}
}
