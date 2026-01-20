import { createUrlSchema } from '#src/schemas/urlSchemas';
import { ShortenUrlService } from '#src/services/urls/ShortenUrlService';
import { FastifyReply, FastifyRequest } from 'fastify';

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
