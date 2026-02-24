import { shortcodeSchema } from '#src/schemas/urlSchemas.js';
import type { FindByShortCodeService } from '#src/services/urls/FindByShortCodeService.js';
import type { RecordClickService } from '#src/services/analytics/RecordClickService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

function notFoundPage(shortcode: string): string {
	return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Link não encontrado</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      color: #1e293b;
    }
    .card {
      text-align: center;
      padding: 3rem 2rem;
      max-width: 420px;
    }
    .code { font-size: 5rem; font-weight: 700; color: #e2e8f0; line-height: 1; }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 1rem 0 0.5rem; }
    p { color: #64748b; margin-bottom: 1.5rem; }
    code {
      background: #f1f5f9;
      padding: 0.2em 0.5em;
      border-radius: 4px;
      font-size: 0.9em;
    }
    a {
      display: inline-block;
      padding: 0.6rem 1.4rem;
      background: #3b82f6;
      color: #fff;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.9rem;
    }
    a:hover { background: #2563eb; }
  </style>
</head>
<body>
  <div class="card">
    <div class="code">404</div>
    <h1>Link não encontrado</h1>
    <p>O código <code>${shortcode}</code> não existe ou foi removido.</p>
    <a href="/">Ir para o início</a>
  </div>
</body>
</html>`;
}

export class FindByShortCodeController {
	constructor(
		private findByShortCodeService: FindByShortCodeService,
		private recordClickService: RecordClickService,
	) {}

	async handle(req: FastifyRequest, reply: FastifyReply) {
		const parsed = shortcodeSchema.safeParse(req.params);

		if (!parsed.success) {
			const shortcode = (req.params as Record<string, string>)['shortcode'] ?? '';
			return reply.status(404).type('text/html').send(notFoundPage(shortcode));
		}

		let result;
		try {
			result = await this.findByShortCodeService.execute(parsed.data.shortcode);
		} catch {
			return reply.status(404).type('text/html').send(notFoundPage(parsed.data.shortcode));
		}

		// Fire-and-forget: não bloqueia o redirect
		this.recordClickService.execute({
			urlId: result.id,
			ip: req.ip,
			userAgent: req.headers['user-agent'] ?? null,
			referer: req.headers.referer ?? null,
		}).catch((err) => {
			console.error('Failed to record click:', err);
		});

		return reply.redirect(result.long_url, 302);
	}
}
