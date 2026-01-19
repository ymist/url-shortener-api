// This file contains code that we reuse between our tests.
import * as path from 'node:path';
import helper from 'fastify-cli/helper.js';

const AppPath = path.join(__dirname, '..', 'src', 'app.ts');

// Fill in this config with all the configurations
// needed for testing the application
function config() {
	return {
		skipOverride: true, // Register our application with fastify-plugin
	};
}

// Automatically build and tear down our instance
async function build() {
	const argv = [AppPath];
	const app = await helper.build(argv, config());
	return app;
}

export { config, build };
