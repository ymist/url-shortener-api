import { resolve } from 'node:path'
import { existsSync } from 'node:fs'

// Carregar .env.test se existir
const envTestPath = resolve(__dirname, '../.env.test')
if (existsSync(envTestPath)) {
  // Usar dotenv ou similar se necessário
  // Por enquanto, assume que variáveis são carregadas externamente
  process.env.NODE_ENV = 'test'
}
