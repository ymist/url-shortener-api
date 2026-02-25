import { RedisCacheProvider } from '#src/cache/redis/RedisCacheProvider.js';
import { FindByShortCodeController } from '#src/controllers/urls/FindByShortCodeController.js';
import { GetUserUrlsController } from '#src/controllers/urls/GetUserUrlsController.js';
import { ShortenUrlController } from '#src/controllers/urls/ShortenUrlController.js';
import { prisma } from '#src/lib/prisma.js';
import { redis } from '#src/lib/redis.js';
import { UrlRepository } from '#src/repositories/prisma/UrlRepository.js';
import { FindByShortCodeService } from '#src/services/urls/FindByShortCodeService.js';
import { GetUserUrlsService } from '#src/services/urls/GetUserUrlsService.js';
import { ShortenUrlService } from '#src/services/urls/ShortenUrlService.js';
import { ValidateSafeUrlService } from '#src/services/urls/ValidateSafeUrlService.js';
import { RecordClickService } from '#src/services/analytics/RecordClickService.js';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';

const urlRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	// Setup dependencies
	const urlRepository = new UrlRepository(prisma);
	const cacheProvider = new RedisCacheProvider(redis);
	const safeBrowsingValidator = new ValidateSafeUrlService(cacheProvider);

	// Setup services
	const shortenUrlService = new ShortenUrlService(urlRepository, cacheProvider, safeBrowsingValidator);
	const findByShortCodeService = new FindByShortCodeService(urlRepository, cacheProvider);
	const recordClickService = new RecordClickService();
	const getUserUrlsService = new GetUserUrlsService(urlRepository);

	// Setup controllers
	const shortenUrlController = new ShortenUrlController(shortenUrlService);
	const findByShortCodeController = new FindByShortCodeController(findByShortCodeService, recordClickService);
	const getUserUrlsController = new GetUserUrlsController(getUserUrlsService);

	// Routes
	fastify.get(
		'/',
		{
			preHandler: [fastify.authenticate],
			config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
		},
		(req, reply) => getUserUrlsController.handle(req, reply),
	);

	fastify.post<{ Body: { long_url: string } }>(
		'/shorten',
		{ config: { rateLimit: { max: 30, timeWindow: '1 minute' } } },
		(req, reply) => shortenUrlController.handle(req, reply),
	);

	fastify.get<{ Params: { shortcode: string } }>(
		'/:shortcode',
		{ config: { rateLimit: { max: 300, timeWindow: '1 minute' } } },
		(req, reply) => findByShortCodeController.handle(req, reply),
	);
};

export default urlRoutes;
