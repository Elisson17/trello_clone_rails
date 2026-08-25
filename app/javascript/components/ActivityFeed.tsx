import { Link } from '@inertiajs/react'
import { BellRingIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { activityText } from '@/lib/activity-text'
import { relativeTime } from '@/lib/card-format'
import { cn } from '@/lib/utils'
import type { ActivityPayload, FeedPage } from '@/types/inertia'

/**
 * O mesmo feed serve o board e o card: no card o título dele já é a tela, então a frase
 * sai sem repetir o card (`bare`).
 */
export function ActivityFeed({
  feed,
  baseUrl,
  bare = false,
}: {
  feed: FeedPage<ActivityPayload>
  baseUrl: string
  bare?: boolean
}) {
  if (feed.items.length === 0) {
    return <p className="text-xs text-muted-foreground">Nada aconteceu aqui ainda.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-2.5">
        {feed.items.map((activity) => (
          <ActivityLine key={activity.id} activity={activity} bare={bare} />
        ))}
      </ol>

      <FeedPager feed={feed} baseUrl={baseUrl} />
    </div>
  )
}

export function ActivityLine({
  activity,
  bare = false,
  strong = false,
  children,
}: {
  activity: ActivityPayload
  bare?: boolean
  /** Linha em peso cheio: é assim que a notificação não lida se distingue da lida. */
  strong?: boolean
  children?: React.ReactNode
}) {
  const text = activityText(activity, bare)

  return (
    <li className="flex items-start gap-2 text-xs leading-relaxed">
      {activity.actor ? (
        <Avatar className="mt-0.5 size-5 shrink-0">
          <AvatarImage src={activity.actor.avatar_url ?? undefined} alt="" />
          <AvatarFallback className="text-[10px]">
            {activity.actor.name[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        // Sem autor é o sistema falando: o lembrete de prazo não tem quem.
        <BellRingIcon aria-hidden className="mt-1 size-4 shrink-0 text-muted-foreground" />
      )}

      <span className={cn('min-w-0 flex-1', strong ? 'text-foreground' : 'text-muted-foreground')}>
        {activity.actor && (
          <span className="font-medium text-foreground">{activity.actor.name}</span>
        )}{' '}
        {activity.url ? (
          <Link href={activity.url} className="rounded-sm hover:text-foreground hover:underline">
            {text}
          </Link>
        ) : (
          text
        )}{' '}
        <time dateTime={activity.created_at} className="whitespace-nowrap text-muted-foreground/70">
          · {relativeTime(activity.created_at)}
        </time>
        {children}
      </span>
    </li>
  )
}

/** Página vai e volta pela URL: o feed não guarda estado nenhum no cliente. */
function FeedPager({ feed, baseUrl }: { feed: FeedPage<unknown>; baseUrl: string }) {
  if (!feed.prev_page && !feed.next_page) return null

  const separator = baseUrl.includes('?') ? '&' : '?'

  return (
    <div className="flex items-center justify-between gap-2 border-t pt-2 text-xs">
      <PagerLink page={feed.prev_page} baseUrl={baseUrl} separator={separator}>
        ← Mais recentes
      </PagerLink>

      <PagerLink page={feed.next_page} baseUrl={baseUrl} separator={separator}>
        Mais antigas →
      </PagerLink>
    </div>
  )
}

function PagerLink({
  page,
  baseUrl,
  separator,
  children,
}: {
  page: number | null
  baseUrl: string
  separator: string
  children: React.ReactNode
}) {
  if (!page) return <span className="text-muted-foreground/40">{children}</span>

  return (
    <Link
      href={`${baseUrl}${separator}page=${page}`}
      preserveScroll
      className={cn('rounded-sm text-muted-foreground transition-colors hover:text-foreground')}
    >
      {children}
    </Link>
  )
}
