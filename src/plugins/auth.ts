import fp from 'fastify-plugin';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken, type JwtPayload } from '#src/lib/jwt.js';

declare module 'fastify' {
	interface FastifyRequest {
		user: JwtPayload | null;
	}
	interface FastifyInstance {
		authenticate: (
			request: FastifyRequest,
			reply: FastifyReply
		) => Promise<void>;
	}
}

export default fp(async (fastify) => {
	fastify.decorateRequest('user', null);

	fastify.decorate(
		'authenticate',
		async (request: FastifyRequest, reply: FastifyReply) => {
			const authHeader = request.headers.authorization;

			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				reply.code(401).send({ error: 'Missing or invalid authorization header' });
				return;
			}

			const token = authHeader.substring(7);

			try {
				const payload = verifyToken(token);
				request.user = payload;
			} catch {
				reply.code(401).send({ error: 'Invalid or expired token' });
			}
		}
	);
});
