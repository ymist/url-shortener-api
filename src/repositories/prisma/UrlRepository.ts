import type { PrismaClient } from '@prisma/client';
import type { IUrlRepository } from '../interfaces/IUrlRepository.js';

export class UrlRepository implements IUrlRepository {
	constructor(private prisma: PrismaClient) {}

	async create(data: { shortcode: string; long_url: string; userId?: string }) {
		const result = await this.prisma.url.create({
			data: {
				shortcode: data.shortcode,
				long_url: data.long_url,
				user_id: data.userId,
			},
		});
		return { shortcode: result.shortcode };
	}

	async findByShortcode(shortcode: string) {
		const result = await this.prisma.url.findUnique({
			where: { shortcode },
			select: { id: true, long_url: true, user_id: true },
		});
		return result;
	}
}
