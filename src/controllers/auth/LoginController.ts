import type { FastifyReply, FastifyRequest } from 'fastify';
import { loginSchema } from '#src/schemas/authSchemas.js';
import type { LoginUserService } from '#src/services/auth/LoginUserService.js';

export class LoginController {
	constructor(private loginUserService: LoginUserService) {}

	async handle(request: FastifyRequest, reply: FastifyReply) {
		const parsed = loginSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.status(400).send({ error: parsed.error.issues });
		}

		try {
			const result = await this.loginUserService.execute(parsed.data);
			return reply.status(200).send(result);
		} catch (error) {
			if (error instanceof Error && error.message === 'Invalid credentials') {
				return reply.status(401).send({ error: error.message });
			}
			throw error;
		}
	}
}
