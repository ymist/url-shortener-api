import type { FastifyReply, FastifyRequest } from 'fastify';
import { analyticsParamsSchema } from '#src/schemas/analyticsSchemas.js';
import type { GetAnalyticsService } from '#src/services/analytics/GetAnalyticsService.js';

export class GetAnalyticsController {
	constructor(private getAnalyticsService: GetAnalyticsService) {}

	async handle(request: FastifyRequest, reply: FastifyReply) {
		const parsed = analyticsParamsSchema.safeParse(request.params);

		if (!parsed.success) {
			return reply.status(400).send({ error: parsed.error.issues });
		}

		if (!request.user) {
			return reply.status(401).send({ error: 'Authentication required' });
		}

		try {
			const result = await this.getAnalyticsService.execute({
				shortcode: parsed.data.shortcode,
				userId: request.user.userId,
			});
			return reply.status(200).send(result);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === 'URL not found') {
					return reply.status(404).send({ error: error.message });
				}
				if (error.message === 'Unauthorized') {
					return reply.status(403).send({ error: 'You do not own this URL' });
				}
			}
			throw error;
		}
	}
}
