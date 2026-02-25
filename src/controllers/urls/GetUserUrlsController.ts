import type { FastifyReply, FastifyRequest } from 'fastify';
import type { GetUserUrlsService } from '#src/services/urls/GetUserUrlsService.js';

export class GetUserUrlsController {
	constructor(private getUserUrlsService: GetUserUrlsService) {}

	async handle(request: FastifyRequest, reply: FastifyReply) {
		if (!request.user) {
			return reply.status(401).send({ error: 'Authentication required' });
		}

		const result = await this.getUserUrlsService.execute(request.user.userId);
		return reply.status(200).send(result);
	}
}
