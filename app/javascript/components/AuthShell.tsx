import { Head, Link } from '@inertiajs/react'
import type { ReactNode } from 'react'

type AuthShellProps = {
  title: string
  description?: string
  footer?: ReactNode
  children: ReactNode
}

/** Casca única das telas de entrada: mesmo card, mesmo espaçamento, mesma marca. */
export function AuthShell({ title, description, footer, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Head title={title} />

      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center text-lg font-bold tracking-tight">
          Trello Clone
        </Link>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-card-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}

          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  )
}
