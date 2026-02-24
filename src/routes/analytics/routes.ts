import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '#src/lib/prisma.js';
import { UrlRepository } from '#src/repositories/prisma/UrlRepository.js';
import { AnalyticsRepository } from '#src/repositories/prisma/AnalyticsRepository.js';
import { GetAnalyticsService } from '#src/services/analytics/GetAnalyticsService.js';
import { GetAnalyticsController } from '#src/controllers/analytics/GetAnalyticsController.js';

const analyticsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	const urlRepository = new UrlRepository(prisma);
	const analyticsRepository = new AnalyticsRepository(prisma);

	const getAnalyticsService = new GetAnalyticsService(urlRepository, analyticsRepository);
	const getAnalyticsController = new GetAnalyticsController(getAnalyticsService);

	fastify.get<{ Params: { shortcode: string } }>(
		'/:shortcode',
		{
			preHandler: [fastify.authenticate],
			config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
		},
		(req, reply) => getAnalyticsController.handle(req, reply),
	);
};

export default analyticsRoutes;
