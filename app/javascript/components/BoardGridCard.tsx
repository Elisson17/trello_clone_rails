import { Link } from '@inertiajs/react'
import { LockIcon } from 'lucide-react'

import { MemberAvatars } from '@/components/MemberAvatars'
import { accentStyle } from '@/lib/accent'
import { BOARD_THEME } from '@/lib/board-theme'
import { cn } from '@/lib/utils'
import type { BoardCardPayload } from '@/types/inertia'

const PREVIEW_HEIGHT = 40

function lastSeen(value: string | null) {
  if (!value) return 'nunca aberto'

  const days = Math.floor((Date.now() - Date.parse(value)) / 86_400_000)
  if (days <= 0) return 'aberto hoje'
  if (days === 1) return 'aberto ontem'
  if (days < 30) return `aberto há ${days} dias`

  return 'aberto há mais de um mês'
}

// Uma barra por lista, altura proporcional à maior: lê como o board em miniatura e não
// cresce com o tamanho dele.
function Preview({ board }: { board: BoardCardPayload }) {
  const tallest = Math.max(1, ...board.preview.map((bar) => bar.count))

  return (
    <div
      aria-hidden
      data-preview
      className="flex items-end gap-1"
      style={{ height: PREVIEW_HEIGHT }}
    >
      {board.preview.map((bar) => (
        <div
          key={bar.list_id}
          className="flex w-2.5 flex-col-reverse justify-start overflow-hidden rounded-sm bg-muted"
          style={{ height: `${Math.max(6, (bar.count / tallest) * PREVIEW_HEIGHT)}px` }}
        >
          {bar.colors.slice(0, 4).map((color, index) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: cores vêm ordenadas do servidor e podem repetir; não há id por cor
              key={`${bar.list_id}-${index}`}
              className={cn('h-1.5 w-full', BOARD_THEME[color].rail)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function BoardGridCard({
  board,
  showWorkspace,
}: {
  board: BoardCardPayload
  showWorkspace: boolean
}) {
  return (
    <Link
      href={`/boards/${board.id}`}
      style={accentStyle(board.workspace.slug)}
      className="group flex h-full flex-col gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-[var(--accent-solid)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="flex items-start gap-2">
        <span
          aria-hidden
          className={cn('mt-1 size-2 shrink-0 rounded-full', BOARD_THEME[board.background].rail)}
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium">{board.title}</h3>
          {showWorkspace && (
            <p className="truncate text-xs text-muted-foreground">{board.workspace.name}</p>
          )}
        </div>

        {board.visibility === 'private_to_members' && (
          <LockIcon
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-label="Board privado"
          />
        )}
      </div>

      <Preview board={board} />

      <div className="mt-auto flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="truncate">
          <span>{lastSeen(board.last_visited_at)}</span>
          {board.counts.overdue > 0 && (
            <>
              {' · '}
              <span className="text-destructive">
                {board.counts.overdue === 1 ? '1 atrasado' : `${board.counts.overdue} atrasados`}
              </span>
            </>
          )}
        </span>

        <MemberAvatars users={board.members.avatars} total={board.members.total} />
      </div>
    </Link>
  )
}
