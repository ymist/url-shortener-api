# Requisitos do Sistema - Encurtador de URLs

## Requisitos Funcionais

1. **Encurtar URL** - Sistema deve receber URL longa e gerar URL curta única
2. **Slug customizado** - Permitir usuário escolher slug personalizado se disponível
3. **Redirecionar** - Ao acessar URL curta, redirecionar para URL original
4. **Registrar analytics** - Capturar timestamp, origem, device, localização de cada acesso
5. **Dashboard de analytics** - Visualizar métricas agregadas (cliques, origem, devices, gráficos por período)
6. **Gerenciar URLs** - Listar, desativar e deletar URLs criadas
7. **Autenticação** - Sistema de login/registro para gerenciar URLs

## Requisitos Não Funcionais

### Performance
- **Redirects:** p95 < 50ms, p99 < 100ms (justifica Redis como cache primário)
- **Criação de URLs:** p95 < 200ms (menos crítico que redirects)
- **Padrão de acesso:** Read-heavy 1000:1 (1000 redirects para cada criação)

### Escala
- **100k URLs criadas/dia** (73M URLs em 2 anos)
- **100M redirects/dia** (pico: 2000 req/s)
- **10M usuários ativos/mês**

### Retenção de Dados
- **URLs expiram após 2 anos** sem acesso (job de cleanup periódico)
- **Analytics granulares por 90 dias** - após isso, dados são agregados
- **100M URLs ativas** simultaneamente no sistema

### Disponibilidade
- **99.9% uptime** (8.7h downtime/ano aceitável)
- **Redirects devem funcionar** mesmo se sistema de analytics estiver down (justifica processamento assíncrono)

### Armazenamento
- **URL curta com 5-7 caracteres** (base62)
  - 5 caracteres = ~916M possibilidades
  - Suficiente para 2 anos de operação (73M URLs)
  - Counter incremental via Redis INCR convertido para base62

## Decisões Técnicas

### Por que Redis?
- **Cache obrigatório** para atingir p95 < 50ms em redirects
- **Counter atômico** (INCR) para gerar IDs únicos sem colisão
- Read-heavy 1000:1 mataria banco sem cache

### Por que Analytics Assíncrono?
- Redirect não pode esperar write de analytics (requisito: p95 < 50ms)
- Disponibilidade: redirect funciona mesmo se analytics falhar
- Escala: 100M eventos/dia não podem bloquear redirects

### Escolha do Banco de Dados

**Produção Real (System Design):**
- **Cassandra seria a escolha ideal:**
  - Write-heavy para analytics (100M eventos/dia)
  - Alta disponibilidade multi-datacenter
  - Escalabilidade horizontal sem downtime
  - Particionamento natural por short_url
  - Sem single point of failure

**Projeto Atual:**
- **PostgreSQL escolhido por:**
  - Foco em aprender Fastify, Vitest, CI/CD (não distribuição de dados)
  - Prisma ORM acelera desenvolvimento
  - Railway = single instance (sem cluster distribuído)
  - Postgres + Redis aguenta 2000 req/s com índices otimizados
  - Projeto acadêmico vs produção em escala global

### Por que Expiração de 2 anos?
- Evita crescimento infinito do banco
- 73M URLs em 2 anos cabe em 8% do espaço disponível (base62, 5 chars)
- Job de cleanup mantém sistema enxuto