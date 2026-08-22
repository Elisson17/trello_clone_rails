# Trello Clone

Kanban colaborativo em **Rails 8 + Inertia + React**, escrito como portfólio: sem serviço
externo obrigatório, sem Redis, sem Sidekiq. `git clone` e dois comandos e o app está no ar.

> **Status:** em desenvolvimento. Autenticação, workspaces com convites, e boards com listas
> e cards — incluindo drag & drop por mouse e por teclado — já funcionam.

## Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Backend | Rails 8.1, SQLite | Um processo, zero infra |
| Frontend | React 19 + TypeScript strict, Inertia 2, Vite (`vite_rails`) | SPA sem API própria |
| UI | Tailwind v4 + shadcn/ui, componentes próprios acima dos primitivos | Design system versionado |
| Auth | Devise (`confirmable`, `recoverable`, `trackable`, `paranoid`) | Fluxo completo, telas em Inertia |
| Filas / cache / cable | Solid Queue, Solid Cache, Solid Cable | Tudo no banco, sem Redis |
| Arquivos | Active Storage service `:local` | Sem S3 |
| E-mail | Action Mailer + Resend (opcional) ou `letter_opener_web` | Nenhuma chave obrigatória |
| Testes | RSpec, FactoryBot, Vitest, Testing Library | Back e front cobertos |
| Qualidade | RuboCop Omakase, Biome, Brakeman, bundler-audit, `bin/ci` | Um comando, oito passos |

## Rodando

Requisitos: Ruby 4.0, [Bun](https://bun.sh) e nada mais (o banco é SQLite).

```bash
bin/setup --skip-server   # gems, pacotes, banco e conta demo
bin/dev                   # Rails + Vite em http://localhost:3000
```

Login demo (criado pelas seeds, só em desenvolvimento):

```
demo@example.com / supersecret
```

Os e-mails do app (confirmação, reset de senha) ficam em
**http://localhost:3000/dev/mails** enquanto não houver chave de e-mail configurada.

## Variáveis de ambiente

Copie `.env.sample` para `.env` e preencha só o que for usar — **nenhuma chave é obrigatória**.

| Variável | Efeito quando preenchida |
|---|---|
| `RESEND_API_KEY` | E-mails passam a sair de verdade via [Resend](https://resend.com), em qualquer ambiente |
| `MAIL_FROM` | Remetente dos e-mails (no Resend, precisa ser domínio verificado) |
| `APP_HOST` | Host usado nos links dos e-mails em produção |

A troca de entrega vive em `config/initializers/mail.rb`: com `RESEND_API_KEY` o
`delivery_method` vira `:resend`; sem ela, `letter_opener_web` em desenvolvimento e `:test`
nos testes. Nenhum segredo é versionado — `.env` está no `.gitignore`.

## Autenticação

- Devise com controllers próprios em `app/controllers/users/`: cada `new`/`edit` renderiza uma
  página Inertia (`Auth/SignIn`, `Auth/SignUp`, `Auth/ForgotPassword`, `Auth/ResetPassword`,
  `Auth/ResendConfirmation`) e cada falha volta como `redirect_to … inertia: { errors: }`,
  caindo no `errors` do `useForm`. Nenhuma view ERB de formulário no projeto.
- Login errado responde **redirect + flash** em vez de 422: `auth_options` sem `:recall`, que é
  o que o protocolo do Inertia espera.
- `config.paranoid = true` — recuperação de senha e reenvio de confirmação respondem igual para
  e-mail existente ou não.
- `rate_limit` nativo do Rails 8 em login, cadastro, reset e reenvio de confirmação.
- `before_action :authenticate_user!` no `ApplicationController`: o app é todo autenticado.
- Perfil com nome, fuso, troca de senha e avatar via Active Storage local, com allowlist de
  tipo (png/jpeg/webp) e limite de 2 MB validados no modelo.

## Frontend

Componentes do shadcn/ui ficam em `app/javascript/components/ui` e são tratados como
primitivos: as regras do projeto moram em componentes próprios um nível acima
(`components/Field.tsx`, `Input.tsx`, `Select.tsx`, `AuthShell.tsx`, `UserMenu.tsx`).
Toda anatomia label/campo/erro passa pelo `Field`, então formulário nenhum reinventa
mensagem de erro. O fuso horário usa `<select>` nativo — busca por digitação, teclado e
roda mobile de graça.

Dark mode sem flash via `hooks/use-theme.ts` (classe `.dark`, sem `next-themes`), toasts com
`sonner` alimentados pelo `flash` do Rails no layout persistente do Inertia.

```
app/javascript
├── components/        # design system do projeto (regras próprias)
│   └── ui/            # primitivos shadcn, gerados pelo CLI
├── entrypoints/       # bootstrap do Inertia
├── hooks/  layouts/  pages/  types/
```

## Testes e qualidade

```bash
bin/ci            # setup, rubocop, biome, tsc, bundler-audit, brakeman, rspec, vitest
bin/rspec         # back
bun run test      # front
bun run typecheck # tsc --noEmit
```

Convenção de teste: nomes em inglês e **um `expect` por bloco `it`**, tanto em RSpec quanto
nos `.test.tsx`.

## Decisões que valem uma linha

- **Devise em vez do generator nativo do Rails 8**: o generator entrega login e reset, mas
  confirmação de e-mail, trackable e paranoid viriam à mão.
- **SQLite + Solid \***: filas, cache e websocket no próprio banco. O diferencial do Rails 8 é
  não precisar de Redis, e o projeto existe para mostrar isso.
- **Sem `active_storage_validations`**: duas validações no modelo resolvem; gem inteira não.
