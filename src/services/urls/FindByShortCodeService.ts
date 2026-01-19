import { ICacheProvider } from '../../cache/interfaces/ICacheProvider.js';
import { IUrlRepository } from '../../repositories/interfaces/IUrlRepository.js';

export class FindByShortCodeService {
	constructor(
		private urlRepository: IUrlRepository,
		private cacheProvider: ICacheProvider, // tipagem depois
	) {}
	async execute(shortcode: string) {
		// TODO: Validação com Zod

		const cacheMap = await this.cacheProvider.get(`url:${shortcode}`);

		if (cacheMap) {
			await this.cacheProvider.set(`url:${shortcode}`, cacheMap, 86400);
			return { long_url: cacheMap };
		}

		const urlMap = await this.urlRepository.findByShortcode(shortcode);

		if (!urlMap) {
			throw new Error('URL not found');
		}

		// Salva no cache pra próxima
		await this.cacheProvider.set(`url:${shortcode}`, urlMap.long_url, 86400);

		return urlMap;
	}
}
