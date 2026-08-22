import { usePage } from '@inertiajs/react'
import { type ReactNode, useEffect } from 'react'
import { toast } from 'sonner'

import { ThemeToggle } from '@/components/theme-toggle'
import { Toaster } from '@/components/ui/sonner'
import type { SharedProps } from '@/types/inertia'

/**
 * Layout persistente: não desmonta entre navegações do Inertia, então o Toaster
 * mantém os toasts na tela e o estado do header sobrevive à troca de página.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { flash } = usePage<SharedProps>().props

  useEffect(() => {
    if (flash.notice) toast.success(flash.notice)
    if (flash.alert) toast.error(flash.alert)
  }, [flash])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex h-14 items-center justify-end border-b px-4">
        <ThemeToggle />
      </header>
      {children}
      <Toaster position="bottom-right" />
    </div>
  )
}
