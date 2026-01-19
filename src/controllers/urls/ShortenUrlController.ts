import { FastifyReply, FastifyRequest } from 'fastify';
import { ShortenUrlService } from '../../services/urls/ShortenUrlService.js';
import { createUrlSchema } from '../../schemas/urlSchemas.js';

export class ShortenUrlController {
	constructor(private shortenUrlService: ShortenUrlService) {}
	async handle(request: FastifyRequest, reply: FastifyReply) {
		const parsed = createUrlSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.status(400).send({ error: parsed.error.issues });
		}

		const result = await this.shortenUrlService.execute(parsed.data.long_url);

		return reply.status(201).send(result);
	}
}
