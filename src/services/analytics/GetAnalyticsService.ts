import type { IUrlRepository } from '#src/repositories/interfaces/IUrlRepository.js';
import type { IAnalyticsRepository, UrlAnalytics } from '#src/repositories/interfaces/IAnalyticsRepository.js';

interface GetAnalyticsInput {
	shortcode: string;
	userId: string;
}

interface GetAnalyticsOutput extends UrlAnalytics {
	shortcode: string;
}

export class GetAnalyticsService {
	constructor(
		private urlRepository: IUrlRepository,
		private analyticsRepository: IAnalyticsRepository,
	) {}

	async execute(input: GetAnalyticsInput): Promise<GetAnalyticsOutput> {
		const url = await this.urlRepository.findByShortcode(input.shortcode);

		if (!url) {
			throw new Error('URL not found');
		}

		if (url.user_id !== input.userId) {
			throw new Error('Unauthorized');
		}

		const analytics = await this.analyticsRepository.findByUrlId(url.id);

		return {
			shortcode: input.shortcode,
			...analytics,
		};
	}
}
