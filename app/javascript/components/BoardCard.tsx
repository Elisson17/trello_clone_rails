import { Link } from '@inertiajs/react'
import { LockIcon } from 'lucide-react'

import { BOARD_THEME } from '@/lib/board-theme'
import { cn } from '@/lib/utils'
import type { BoardBackground, BoardVisibility } from '@/types/inertia'

type BoardCardProps = {
  id: number
  title: string
  background: BoardBackground
  visibility?: BoardVisibility
  meta?: string
  className?: string
}

export function BoardCard({ id, title, background, visibility, meta, className }: BoardCardProps) {
  const theme = BOARD_THEME[background]

  return (
    <Link
      href={`/boards/${id}`}
      className={cn(
        'group flex items-center gap-3 rounded-xl border bg-card p-3 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className,
      )}
    >
      <span aria-hidden className={cn('h-10 w-1.5 shrink-0 rounded-full', theme.rail)} />

      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{title}</span>
        {meta && <span className="block text-xs text-muted-foreground">{meta}</span>}
      </span>

      {visibility === 'private_to_members' && (
        <LockIcon className="size-3.5 shrink-0 text-muted-foreground" aria-label="Board privado" />
      )}
    </Link>
  )
}
