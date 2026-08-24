import { router, usePage } from '@inertiajs/react'
import { BellIcon, CheckCheckIcon } from 'lucide-react'
import { useState } from 'react'

import { ActivityLine } from '@/components/ActivityFeed'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { SharedProps } from '@/types/inertia'

export function NotificationBell({ count }: { count: number }) {
  const { notifications } = usePage<SharedProps>().props
  const [open, setOpen] = useState(false)

  const label =
    count > 0 ? `Notificações (${count} não lida${count > 1 ? 's' : ''})` : 'Notificações'

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        // A prop é `optional` no servidor: sem este pedido explícito ela nunca chega.
        if (next) router.reload({ only: ['notifications'] })
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={label}>
          <BellIcon />

          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 rounded-full bg-destructive px-1 text-[10px] leading-4 font-semibold text-white tabular-nums">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-88 p-0">
        <header className="flex items-center justify-between gap-2 border-b px-3 py-2">
          <h2 className="text-sm font-semibold">Notificações</h2>

          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => router.patch('/notifications/read', {}, { preserveScroll: true })}
            >
              <CheckCheckIcon className="size-3.5" />
              Marcar todas como lidas
            </Button>
          )}
        </header>

        {notifications === undefined ? (
          <Skeleton />
        ) : notifications.items.length === 0 ? (
          <p className="px-4 py-10 text-center text-xs text-muted-foreground">
            Nada por aqui. Quando alguém te mencionar ou te atribuir um card, aparece nesta lista.
          </p>
        ) : (
          <ol className="max-h-96 divide-y overflow-y-auto">
            {notifications.items.map((notification) => (
              <li
                key={notification.id}
                className={cn('px-3 py-2.5', !notification.read && 'bg-accent/40')}
              >
                <ol>
                  <ActivityLine activity={notification.activity}>
                    <span className="block text-[11px] text-muted-foreground/70">
                      {notification.board.title}
                    </span>
                  </ActivityLine>
                </ol>
              </li>
            ))}
          </ol>
        )}
      </PopoverContent>
    </Popover>
  )
}

// O painel abre cheio e preenche; em branco esperando ele pareceria quebrado.
function Skeleton() {
  return (
    <div className="flex flex-col gap-3 p-3" aria-hidden>
      {[0, 1, 2].map((line) => (
        <div key={line} className="flex gap-2">
          <span className="size-5 shrink-0 rounded-full bg-muted" />
          <span className="h-8 flex-1 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}
