import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { UrlRepository } from '../../repositories/prisma/UrlRepository.js';
import { RedisCacheProvider } from '../../cache/redis/RedisCacheProvider.js';
import { ShortenUrlService } from '../../services/urls/ShortenUrlService.js';
import { FindByShortCodeService } from '../../services/urls/FindByShortCodeService.js';
import { ShortenUrlController } from '../../controllers/urls/ShortenUrlController.js';
import { FindByShortCodeController } from '../../controllers/urls/FindByShortCodeController.js';
import { redis } from '../../lib/redis.js';
import { prisma } from '../../lib/prisma.js';

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
