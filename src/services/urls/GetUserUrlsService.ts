import type { IUrlRepository } from '#src/repositories/interfaces/IUrlRepository.js';

export class GetUserUrlsService {
	constructor(private urlRepository: IUrlRepository) {}

	async execute(userId: string) {
		return this.urlRepository.findByUserId(userId);
	}
}
