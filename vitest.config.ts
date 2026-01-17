import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    // Ambiente Node.js para Fastify
    environment: 'node',

    // Não usar globals - importar explicitamente test/expect
    globals: false,

    // Padrões de arquivos de teste
    include: ['test/**/*.test.ts', 'test/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'coverage'],

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
        'dist/**'
      ],
      // Thresholds mínimos de 70% conforme CLAUDE.md
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70
      }
    },

    // Setup para carregar .env.test
    setupFiles: ['./test/setup.ts']
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
