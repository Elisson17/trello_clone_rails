import { usePage } from '@inertiajs/react'
import { MenuIcon } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AppSidebar } from '@/components/AppSidebar'
import { NotificationBell } from '@/components/NotificationBell'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'
import type { SharedProps } from '@/types/inertia'

// Só aparecem com foco, e são os dois primeiros tabs da página: sem eles, chegar ao
// conteúdo pelo teclado passa pela navegação inteira a cada troca de página.
const SKIP =
  'sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:outline-2 focus:outline-ring'

/**
 * Layout persistente: não desmonta entre navegações do Inertia, então a sidebar não
 * repinta a cada página, os toasts sobrevivem e a gaveta guarda o próprio estado.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { auth, flash, unread_notifications_count, nav } = usePage<SharedProps>().props
  const [drawer, setDrawer] = useState(false)

  useEffect(() => {
    if (flash.notice) toast.success(flash.notice)
    if (flash.alert) toast.error(flash.alert)
  }, [flash])

  // Telas de autenticação não têm para onde navegar: sem sidebar, sem header.
  if (!auth.user || !nav) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main id="main">{children}</main>
        <Toaster position="bottom-right" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#nav" className={SKIP}>
        Pular para a navegação
      </a>
      <a href="#main" className={SKIP}>
        Pular para o conteúdo
      </a>

      <div className="flex min-h-screen">
        <div id="nav" className="hidden w-60 shrink-0 border-r lg:block">
          <div className="sticky top-0 h-screen">
            <AppSidebar user={auth.user} nav={nav} />
          </div>
        </div>

        {/* Abaixo de lg a sidebar comeria uma coluna do board, que já rola de lado. */}
        <Sheet open={drawer} onOpenChange={setDrawer}>
          <SheetContent side="left" className="w-60 p-0">
            <SheetTitle className="sr-only">Navegação</SheetTitle>
            <AppSidebar user={auth.user} nav={nav} />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-12 items-center gap-1 border-b px-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Abrir navegação"
              onClick={() => setDrawer(true)}
            >
              <MenuIcon />
            </Button>

            <div className="flex-1" />

            <NotificationBell count={unread_notifications_count} />
          </header>

          <main id="main" className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>

      <Toaster position="bottom-right" />
    </div>
  )
}
