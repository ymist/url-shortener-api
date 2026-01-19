import { FastifyReply, FastifyRequest } from 'fastify';
import { FindByShortCodeService } from '../../services/urls/FindByShortCodeService.js';
import { shortcodeSchema } from '../../schemas/urlSchemas.js';

export class FindByShortCodeController {
	constructor(private findByShortCodeService: FindByShortCodeService) {}

	async handle(req: FastifyRequest, reply: FastifyReply) {
		const parsed = shortcodeSchema.safeParse(req.params);

		if (!parsed.success) {
			return reply.status(400).send({ error: parsed.error.issues });
		}

		const result = await this.findByShortCodeService.execute(parsed.data.shortcode);

		return reply.redirect(result.long_url, 302);
	}
}
