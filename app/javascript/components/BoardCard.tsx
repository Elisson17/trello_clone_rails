import { Link } from '@inertiajs/react'
import { LockIcon } from 'lucide-react'

import { accentStyle } from '@/lib/accent'
import { BOARD_THEME } from '@/lib/board-theme'
import { cn } from '@/lib/utils'
import type { BoardBackground, BoardVisibility } from '@/types/inertia'

type BoardCardProps = {
  id: number
  title: string
  background: BoardBackground
  visibility?: BoardVisibility
  meta?: string
  /** Slug do workspace: a borda de hover herda a cor dele, como na grade da home. */
  accentSeed?: string
  className?: string
}

/**
 * Mesma anatomia do tile da home — ponto da cor do board, título, meta — para onde o
 * payload não tem o preview das listas: busca e outras listagens curtas.
 */
export function BoardCard({
  id,
  title,
  background,
  visibility,
  meta,
  accentSeed,
  className,
}: BoardCardProps) {
  return (
    <Link
      href={`/boards/${id}`}
      style={accentSeed ? accentStyle(accentSeed) : undefined}
      className={cn(
        'flex items-start gap-2 rounded-lg border bg-card p-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        accentSeed ? 'hover:border-(--accent-solid)' : 'hover:border-foreground/20',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('mt-1 size-2 shrink-0 rounded-full', BOARD_THEME[background].rail)}
      />

      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{title}</span>
        {meta && <span className="block truncate text-xs text-muted-foreground">{meta}</span>}
      </span>

      {visibility === 'private_to_members' && (
        <LockIcon
          className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
          aria-label="Board privado"
        />
      )}
    </Link>
  )
}
