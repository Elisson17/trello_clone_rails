import { Head, router } from '@inertiajs/react'
import { CheckCheckIcon } from 'lucide-react'

import { ActivityLine } from '@/components/ActivityFeed'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import type { FeedPage, NotificationPayload } from '@/types/inertia'

export default function NotificationsIndex({
  notifications,
}: {
  notifications: FeedPage<NotificationPayload>
}) {
  const unread = notifications.items.filter((notification) => !notification.read).length

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Head title="Notificações" />

      <PageHeader>
        <h1 className="shrink-0 text-sm font-semibold tracking-tight">Notificações</h1>

        {unread > 0 && (
          <>
            <span aria-hidden className="text-xs text-muted-foreground/40">
              /
            </span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {unread} não {unread === 1 ? 'lida' : 'lidas'}
            </span>
          </>
        )}
      </PageHeader>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Menção em comentário, card atribuído a você e prazo chegando.
        </p>

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
        <p className="mt-6 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nada por aqui. Quando alguém te mencionar ou te atribuir um card, aparece nesta lista.
        </p>
      ) : (
        <ol className="mt-5 divide-y rounded-xl border bg-card">
          {notifications.items.map((notification) => (
            <li key={notification.id} className="px-3 py-2.5">
              <ol>
                {/* Lida ou não é peso do texto: cor de fundo aqui competiria com a cor do board. */}
                <ActivityLine activity={notification.activity} strong={!notification.read}>
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
  if (!page) return <span className="px-2 text-muted-foreground/40">{children}</span>

  return (
    <Button variant="ghost" size="sm" onClick={() => router.get('/notifications', { page })}>
      {children}
    </Button>
  )
}
