import { Head, Link } from '@inertiajs/react'
import type { ReactNode } from 'react'

type AuthShellProps = {
  title: string
  description?: string
  footer?: ReactNode
  children: ReactNode
}

/**
 * A única tela sem sidebar do app, e a única que respira: fundo recuado, cartão claro em
 * cima dele. A elevação é a diferença de superfície mais a borda — nenhuma sombra.
 */
export function AuthShell({ title, description, footer, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-12">
      <Head title={title} />

      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mx-auto mb-8 block w-fit rounded-sm text-base font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Trello Clone
        </Link>

        <div className="rounded-xl border bg-card p-6">
          <h1 className="text-lg font-semibold tracking-tight text-card-foreground">{title}</h1>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}

          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-muted-foreground">{footer}</div>}
      </div>
    </div>
  )
}
