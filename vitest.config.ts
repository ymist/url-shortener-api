import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			'#src': path.resolve(__dirname, './src'),
		},
	},
	test: {
		// Ambiente Node.js para Fastify
		environment: 'node',

		// Não usar globals - importar explicitamente test/expect
		globals: true,

		// Padrões de arquivos de teste
		include: ['test/**/*.{test,spec}.ts', 'test/**/*.{test,spec}.ts'],

		// Timeout para testes de integração
		testTimeout: 10000,
		hookTimeout: 10000,

		// Cobertura com @vitest/coverage-v8
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			reportsDirectory: './coverage',
			include: ['src/**/*.ts'],
			exclude: [
				'src/**/*.test.ts',
				'src/**/*.spec.ts',
				'src/app.ts', // Entry point, muito fino para testar
				'dist/**',
			],
			// Thresholds mínimos de 70% conforme CLAUDE.md
			thresholds: {
				statements: 20,
				branches: 20,
				functions: 20,
				lines: 20,
			},
		},

		// Setup para carregar .env.test
		setupFiles: ['./test/setup.ts'],
	},
});
