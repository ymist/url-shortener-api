import { shortcodeSchema } from '#src/schemas/urlSchemas.js';
import type { FindByShortCodeService } from '#src/services/urls/FindByShortCodeService.js';
import type { RecordClickService } from '#src/services/analytics/RecordClickService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

export class FindByShortCodeController {
	constructor(
		private findByShortCodeService: FindByShortCodeService,
		private recordClickService: RecordClickService,
	) {}

	async handle(req: FastifyRequest, reply: FastifyReply) {
		const parsed = shortcodeSchema.safeParse(req.params);

		if (!parsed.success) {
			return reply.status(400).send({ error: parsed.error.issues });
		}

		const result = await this.findByShortCodeService.execute(parsed.data.shortcode);

		// Fire-and-forget: não bloqueia o redirect
		this.recordClickService.execute({
			urlId: result.id,
			ip: req.ip,
			userAgent: req.headers['user-agent'] ?? null,
			referer: req.headers.referer ?? null,
		}).catch((err) => {
			console.error('Failed to record click:', err);
		});

		return reply.redirect(result.long_url, 302);
	}
}
