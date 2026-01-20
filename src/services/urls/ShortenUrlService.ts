import { ICacheProvider } from '#src/cache/interfaces/ICacheProvider';
import { IUrlRepository } from '#src/repositories/interfaces/IUrlRepository';
import { generateSlug } from '#src/utils/generateSlug';

export class ShortenUrlService {
	constructor(
		private urlRepository: IUrlRepository,
		private cacheProvider: ICacheProvider, // tipagem depois
	) {}

	async execute(url: string): Promise<{ shortcode: string }> {
		//TODO: Validar URL (Zod vai fazer isso antes no controller)
		const counter = await this.cacheProvider.incr('url_counter');
		const shortcode = generateSlug(counter);
		const created = await this.urlRepository.create({
			shortcode,
			long_url: url,
		});

		return { shortcode: created.shortcode };
	}
}
