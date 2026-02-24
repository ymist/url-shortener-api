import type { FastifyReply, FastifyRequest } from 'fastify';
import { registerSchema } from '#src/schemas/authSchemas.js';
import type { RegisterUserService } from '#src/services/auth/RegisterUserService.js';

export class RegisterController {
	constructor(private registerUserService: RegisterUserService) {}

	async handle(request: FastifyRequest, reply: FastifyReply) {
		const parsed = registerSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.status(400).send({ error: parsed.error.issues });
		}

		try {
			const result = await this.registerUserService.execute(parsed.data);
			return reply.status(201).send(result);
		} catch (error) {
			if (error instanceof Error && error.message === 'Email already registered') {
				return reply.status(409).send({ error: error.message });
			}
			throw error;
		}
	}
}
