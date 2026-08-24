import { Link, usePage } from '@inertiajs/react'
import { type ReactNode, useEffect } from 'react'
import { toast } from 'sonner'

import { GlobalSearch } from '@/components/GlobalSearch'
import { NotificationBell } from '@/components/NotificationBell'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/UserMenu'
import { Toaster } from '@/components/ui/sonner'
import type { SharedProps } from '@/types/inertia'

/**
 * Layout persistente: não desmonta entre navegações do Inertia, então os toasts e o
 * estado do header sobrevivem à troca de página.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { auth, flash, unread_notifications_count } = usePage<SharedProps>().props

  useEffect(() => {
    if (flash.notice) toast.success(flash.notice)
    if (flash.alert) toast.error(flash.alert)
  }, [flash])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Primeiro tab da página: sem isso, chegar ao board pelo teclado passa por todo o
          header em cada navegação. Só aparece quando tem foco. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:outline-2 focus:outline-ring"
      >
        Pular para o conteúdo
      </a>

      <header className="flex h-14 items-center gap-1 border-b px-4">
        <Link
          href="/"
          className="rounded-sm font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Trello Clone
        </Link>
        {auth.user && <GlobalSearch />}
        <div className="flex-1" />
        <ThemeToggle />
        {auth.user && <NotificationBell count={unread_notifications_count} />}
        {auth.user && <UserMenu user={auth.user} />}
      </header>
      <main id="main">{children}</main>
      <Toaster position="bottom-right" />
    </div>
  )
}
