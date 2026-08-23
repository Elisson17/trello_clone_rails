import { Head, router } from '@inertiajs/react'
import { CheckCheckIcon } from 'lucide-react'

import { ActivityLine } from '@/components/ActivityFeed'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FeedPage, NotificationPayload } from '@/types/inertia'

export default function NotificationsIndex({
  notifications,
}: {
  notifications: FeedPage<NotificationPayload>
}) {
  const unread = notifications.items.filter((notification) => !notification.read).length

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Head title="Notificações" />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notificações</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Menção em comentário, card atribuído a você e prazo chegando.
          </p>
        </div>

        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.patch('/notifications/read', {}, { preserveScroll: true })}
          >
            <CheckCheckIcon />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {notifications.items.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nada por aqui. Quando alguém te mencionar ou te atribuir um card, aparece nesta lista.
        </p>
      ) : (
        <ol className="mt-6 divide-y rounded-xl border bg-card">
          {notifications.items.map((notification) => (
            <li
              key={notification.id}
              className={cn('px-4 py-3', !notification.read && 'bg-accent/40')}
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

      <Pager feed={notifications} />
    </div>
  )
}

function Pager({ feed }: { feed: FeedPage<NotificationPayload> }) {
  if (!feed.prev_page && !feed.next_page) return null

  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <PageLink page={feed.prev_page}>← Mais recentes</PageLink>
      <PageLink page={feed.next_page}>Mais antigas →</PageLink>
    </div>
  )
}

function PageLink({ page, children }: { page: number | null; children: React.ReactNode }) {
  if (!page) return <span className="text-muted-foreground/40">{children}</span>

  return (
    <Button variant="ghost" size="sm" onClick={() => router.get('/notifications', { page })}>
      {children}
    </Button>
  )
}
