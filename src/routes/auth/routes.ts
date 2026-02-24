import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '#src/lib/prisma.js';
import { UserRepository } from '#src/repositories/prisma/UserRepository.js';
import { RegisterUserService } from '#src/services/auth/RegisterUserService.js';
import { LoginUserService } from '#src/services/auth/LoginUserService.js';
import { RegisterController } from '#src/controllers/auth/RegisterController.js';
import { LoginController } from '#src/controllers/auth/LoginController.js';

const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	const userRepository = new UserRepository(prisma);

	const registerUserService = new RegisterUserService(userRepository);
	const loginUserService = new LoginUserService(userRepository);

	const registerController = new RegisterController(registerUserService);
	const loginController = new LoginController(loginUserService);

	fastify.post(
		'/register',
		{ config: { rateLimit: { max: 5, timeWindow: '15 minutes' } } },
		(req, reply) => registerController.handle(req, reply),
	);

	fastify.post(
		'/login',
		{ config: { rateLimit: { max: 10, timeWindow: '15 minutes' } } },
		(req, reply) => loginController.handle(req, reply),
	);
};

export default authRoutes;
