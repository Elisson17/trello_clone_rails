import { Head, Link } from '@inertiajs/react'
import type { ReactNode } from 'react'

type AuthShellProps = {
  title: string
  description?: string
  footer?: ReactNode
  children: ReactNode
}

/**
 * As únicas telas sem sidebar do app: split 30/70, formulário direto no fundo à esquerda
 * e o render do board ocupando o resto. Abaixo de `lg` a arte some e sobra o formulário.
 */
export function AuthShell({ title, description, footer, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Head title={title} />

      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-[30%] lg:shrink-0 lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 block w-fit rounded-sm text-base font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Trello Clone
          </Link>

          <h1 className="text-lg font-semibold tracking-tight text-card-foreground">{title}</h1>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}

          <div className="mt-6">{children}</div>

          {footer && <div className="mt-6 text-muted-foreground">{footer}</div>}
        </div>
      </div>

      {/* O render é escuro por conta própria: o painel leva fundo fixo, não token de tema. */}
      <div className="relative hidden flex-1 overflow-hidden bg-[#08090a] lg:block">
        <img
          src="/images/login.webp"
          alt="Board do Trello Clone com listas e cards"
          className="size-full object-cover object-left"
        />
        {/* Sangria para o fundo do formulário, para a arte não terminar num corte reto. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
      </div>
    </div>
  )
}
