import { RedisCacheProvider } from '#src/cache/redis/RedisCacheProvider';
import { FindByShortCodeController } from '#src/controllers/urls/FindByShortCodeController';
import { ShortenUrlController } from '#src/controllers/urls/ShortenUrlController';
import { prisma } from '#src/lib/prisma';
import { redis } from '#src/lib/redis';
import { UrlRepository } from '#src/repositories/prisma/UrlRepository';
import { FindByShortCodeService } from '#src/services/urls/FindByShortCodeService';
import { ShortenUrlService } from '#src/services/urls/ShortenUrlService';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';

const urlRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	// Setup dependencies
	const urlRepository = new UrlRepository(prisma);
	const cacheProvider = new RedisCacheProvider(redis);

	// Setup services
	const shortenUrlService = new ShortenUrlService(urlRepository, cacheProvider);
	const findByShortCodeService = new FindByShortCodeService(urlRepository, cacheProvider);

	// Setup controllers
	const shortenUrlController = new ShortenUrlController(shortenUrlService);
	const findByShortCodeController = new FindByShortCodeController(findByShortCodeService);

	// Routes
	fastify.post<{ Body: { long_url: string } }>('/shorten', (req, reply) => shortenUrlController.handle(req, reply));

	fastify.get<{ Params: { shortcode: string } }>('/:shortcode', (req, reply) =>
		findByShortCodeController.handle(req, reply),
	);
};

export default urlRoutes;
