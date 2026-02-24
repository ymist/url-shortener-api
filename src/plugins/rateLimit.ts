import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import { redis } from '#src/lib/redis.js';

export default fp(async (fastify) => {
	await fastify.register(rateLimit, {
		global: true,
		max: 100,
		timeWindow: '1 minute',
		redis,
		keyGenerator: (request) =>
			request.headers['x-forwarded-for']?.toString().split(',')[0]?.trim()
			?? request.ip,
	});
});
