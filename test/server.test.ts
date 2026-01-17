import { test, expect } from 'vitest'
import { build } from './helper.js'

test('servidor inicia com sucesso', async () => {
  const app = await build()

  expect(app).toBeDefined()
  expect(app.server).toBeDefined()
})

test('servidor responde a requisições', async () => {
  const app = await build()

  const response = await app.inject({
    method: 'GET',
    url: '/'
  })

  expect(response.statusCode).toBe(200)
  expect(response.headers['content-type']).toContain('application/json')
})

test('servidor está pronto após inicialização', async () => {
  const app = await build()

  await expect(app.ready()).resolves.toBeDefined()
})
