import { Link, usePage } from '@inertiajs/react'
import { type ReactNode, useEffect } from 'react'
import { toast } from 'sonner'

import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/UserMenu'
import { Toaster } from '@/components/ui/sonner'
import type { SharedProps } from '@/types/inertia'

/**
 * Layout persistente: não desmonta entre navegações do Inertia, então o Toaster
 * mantém os toasts na tela e o estado do header sobrevive à troca de página.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { auth, flash } = usePage<SharedProps>().props

  useEffect(() => {
    if (flash.notice) toast.success(flash.notice)
    if (flash.alert) toast.error(flash.alert)
  }, [flash])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex h-14 items-center gap-1 border-b px-4">
        <Link href="/" className="font-bold tracking-tight">
          Trello Clone
        </Link>
        {auth.user && (
          <Link
            href="/workspaces"
            className="ml-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Workspaces
          </Link>
        )}
        <div className="flex-1" />
        <ThemeToggle />
        {auth.user && <UserMenu user={auth.user} />}
      </header>
      {children}
      <Toaster position="bottom-right" />
    </div>
  )
}
