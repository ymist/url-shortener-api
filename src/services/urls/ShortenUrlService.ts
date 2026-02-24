import type { ICacheProvider } from '#src/cache/interfaces/ICacheProvider.js';
import type { IUrlRepository } from '#src/repositories/interfaces/IUrlRepository.js';
import type { ISafeUrlValidator } from '#src/services/urls/interfaces/ISafeUrlValidator.js';
import { generateSlug } from '#src/utils/generateSlug.js';

interface ShortenUrlInput {
	url: string;
	userId?: string;
}

export class ShortenUrlService {
	constructor(
		private urlRepository: IUrlRepository,
		private cacheProvider: ICacheProvider,
		private urlValidator: ISafeUrlValidator,
	) {}

	async execute(input: ShortenUrlInput): Promise<{ shortcode: string }> {
		const safe = await this.urlValidator.isSafe(input.url);
		if (!safe) {
			const err = new Error('URL flagged as unsafe by Google Safe Browsing');
			(err as Error & { statusCode: number }).statusCode = 422;
			throw err;
		}

		const counter = await this.cacheProvider.incr('url_counter');
		const shortcode = generateSlug(counter);
		const created = await this.urlRepository.create({
			shortcode,
			long_url: input.url,
			userId: input.userId,
		});

		return { shortcode: created.shortcode };
	}
}
