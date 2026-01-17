# CLAUDE.md - Encurtador de URLs

## Sobre o Projeto

Sistema de encurtador de URLs com analytics. Foco em aprender Fastify, Vitest, CI/CD e arquitetura em camadas na prática.

## Stack

### Backend

-   **Fastify** (não Express) - quero aprender essa alternativa
-   **Prisma ORM** - já conheço, prefiro focar em outras novidades
-   **Vitest** - melhor DX que Jest, uso snapshot e mock functions
-   **Zod** - validação em todos os endpoints
-   **Redis** - cache crítico aqui porque cada redirect bate no banco sem cache

### Frontend

-   **Next.js** - padrão do mercado
-   **React Query** - gerencia cache de API, reduz necessidade de estado global
-   **Context API** - estado global simples quando React Query não resolve (usuário, tema)
-   **Tailwind + Shadcn** - produtividade

## Arquitetura Backend

**Layered com Repository Pattern:**

```
/controllers -> /services -> /repositories -> database
```

**Services são use cases separados** - não classes gigantes. Exemplo:

-   `CreateShortUrlService.ts`
-   `GetAnalyticsService.ts`

Por quê: arquivos grandes viram God Objects. Prefiro imports verbosos mas responsabilidades claras.

**Injeção de Dependência sempre** - services nunca importam repositórios diretamente. Recebem via construtor. Por quê: amanhã posso trocar Prisma por outra coisa e só mexo no repository.

## Regras de Negócio

**Cache é mandatório** - cada redirect deve buscar Redis primeiro. Se miss, busca Postgres e popula cache. Por quê: milhares de redirects matariam o banco.

**Analytics assíncrono** - não trava o redirect pra salvar analytics. Use fila ou fire-and-forget. Por quê: usuário não pode esperar 200ms pra ser redirecionado.

**Validação com Zod em todo request** - controllers sempre validam entrada antes de chamar service.

## Testes

**Vitest com cobertura mínima de 70%** nos services. Repositories podem mockar o banco com containers de teste se necessário.

**Não testo controllers** - são finos demais. Foco nos services onde está a lógica.

## CI/CD

GitHub Actions básico:

-   Roda testes em todo PR
-   Deploy automático no merge pra main (Railway backend, Vercel frontend)

## Observações

-   **Postgres** é o banco padrão, mas repositories permitem troca fácil
-   Use **GitHub Projects** pra organizar issues e tarefas
-   Commits seguem conventional commits (feat:, fix:, etc)
-   Não over-engineer - foco em código limpo e funcional, não perfeição arquitetural
