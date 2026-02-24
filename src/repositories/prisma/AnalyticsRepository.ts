import type { PrismaClient } from '@prisma/client';
import type {
	IAnalyticsRepository,
	CreateAnalyticsData,
	AnalyticsRecord,
	UrlAnalytics,
} from '../interfaces/IAnalyticsRepository.js';

export class AnalyticsRepository implements IAnalyticsRepository {
	constructor(private prisma: PrismaClient) {}

	async create(data: CreateAnalyticsData): Promise<AnalyticsRecord> {
		const result = await this.prisma.analytics.create({
			data: {
				url_id: data.urlId,
				ip: data.ip,
				user_agent: data.userAgent,
				referer: data.referer,
			},
		});

		return {
			id: result.id,
			urlId: result.url_id,
			ip: result.ip,
			userAgent: result.user_agent,
			referer: result.referer,
			clickedAt: result.clicked_at,
		};
	}

	async findByUrlId(urlId: string): Promise<UrlAnalytics> {
		const [totalResult, clicksByDay, topReferers] = await Promise.all([
			this.prisma.analytics.count({
				where: { url_id: urlId },
			}),
			this.prisma.$queryRaw<{ date: string; count: bigint }[]>`
				SELECT DATE(clicked_at) as date, COUNT(*) as count
				FROM analytics
				WHERE url_id = ${urlId}
				GROUP BY DATE(clicked_at)
				ORDER BY date DESC
				LIMIT 30
			`,
			this.prisma.$queryRaw<{ referer: string; count: bigint }[]>`
				SELECT referer, COUNT(*) as count
				FROM analytics
				WHERE url_id = ${urlId} AND referer IS NOT NULL
				GROUP BY referer
				ORDER BY count DESC
				LIMIT 10
			`,
		]);

		return {
			totalClicks: totalResult,
			clicksByDay: clicksByDay.map((row) => ({
				date: row.date,
				count: Number(row.count),
			})),
			topReferers: topReferers.map((row) => row.referer),
		};
	}
}
