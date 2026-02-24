import { createUrlSchema } from '#src/schemas/urlSchemas.js';
import type { ShortenUrlService } from '#src/services/urls/ShortenUrlService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyToken } from '#src/lib/jwt.js';

export class ShortenUrlController {
	constructor(private shortenUrlService: ShortenUrlService) {}

	async handle(request: FastifyRequest, reply: FastifyReply) {
		const parsed = createUrlSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.status(400).send({ error: parsed.error.issues });
		}

		// Extrai userId do JWT se presente (mas não obrigatório)
		let userId: string | undefined;
		const authHeader = request.headers.authorization;
		if (authHeader?.startsWith('Bearer ')) {
			try {
				const token = authHeader.substring(7);
				const payload = verifyToken(token);
				userId = payload.userId;
			} catch {
				userId = undefined;
			}
		}

		const result = await this.shortenUrlService.execute({
			url: parsed.data.long_url,
			userId,
		});

		return reply.status(201).send(result);
	}
}
