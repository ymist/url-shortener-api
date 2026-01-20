import { PrismaClient, Url } from '@prisma/client';
import { IUrlRepository } from '../interfaces/IUrlRepository';

export class UrlRepository implements IUrlRepository {
	constructor(private prisma: PrismaClient) {}

	async create(data: { shortcode: string; long_url: string }): Promise<Url> {
		return await this.prisma.url.create({
			data: {
				shortcode: data.shortcode,
				long_url: data.long_url,
			},
		});
	}

	async findByShortcode(shortcode: string): Promise<Url | null> {
		return await this.prisma.url.findUnique({ where: { shortcode } });
	}
}
