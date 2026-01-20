// This file contains code that we reuse between our tests.
// Note: We manually register routes instead of using @fastify/autoload
// because autoload uses Node.js dynamic imports which bypass Vitest's TS transformation
import Fastify from 'fastify';
import urlRoutes from '#src/routes/urls/routes';

async function build() {
	const fastify = Fastify();

	// Health check for tests
	fastify.get('/', async () => ({ status: 'ok' }));

	await fastify.register(urlRoutes, { prefix: '/urls' });
	await fastify.ready();
	return fastify;
}

export { build };
