import { ClockIcon, SearchIcon, XIcon } from 'lucide-react'
import { useRef } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type BoardFilter, EMPTY_FILTER, isFiltering, toggleId } from '@/lib/board-filter'
import { BOARD_THEME } from '@/lib/board-theme'
import { cn } from '@/lib/utils'
import type { BoardPayload } from '@/types/inertia'

/**
 * Filtro do board no cliente: o payload já veio inteiro na página, então esconder card
 * não vale um request. Também não vai para a URL, para o link do board continuar sendo
 * o board.
 */
export function BoardFilters({
  board,
  filter,
  onChange,
  visible,
  total,
}: {
  board: BoardPayload
  filter: BoardFilter
  onChange: (filter: BoardFilter) => void
  visible: number
  total: number
}) {
  const field = useRef<HTMLInputElement>(null)
  const active = isFiltering(filter)
  const members = board.members.map((member) => member.user)

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b px-4 py-2">
      <div className="relative w-48">
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-2 left-2.5 size-3.5 text-muted-foreground"
        />
        <Input
          ref={field}
          type="search"
          aria-label="Filtrar cards por título"
          placeholder="Filtrar neste board"
          value={filter.text}
          onChange={(event) => onChange({ ...filter, text: event.target.value })}
          className="h-7 pl-7 text-xs"
        />
      </div>

      {board.labels.map((label) => (
        <button
          key={label.id}
          type="button"
          aria-pressed={filter.labelIds.includes(label.id)}
          onClick={() => onChange({ ...filter, labelIds: toggleId(filter.labelIds, label.id) })}
          // O ponto carrega a identidade da etiqueta nos dois estados; ligado ou
          // desligado é dito pelo acento, que é estado de interface e não da etiqueta.
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            filter.labelIds.includes(label.id)
              ? 'border-primary/50 bg-primary/10 text-foreground'
              : 'border-input text-muted-foreground hover:text-foreground',
          )}
        >
          <i
            aria-hidden
            data-label-dot
            className={cn('size-1.5 shrink-0 rounded-full', BOARD_THEME[label.color].dot)}
          />
          {label.name}
        </button>
      ))}

      {members.map((user) => (
        <button
          key={user.id}
          type="button"
          aria-pressed={filter.assigneeIds.includes(user.id)}
          aria-label={`Filtrar por ${user.name}`}
          onClick={() =>
            onChange({ ...filter, assigneeIds: toggleId(filter.assigneeIds, user.id) })
          }
          className={cn(
            'rounded-full transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            filter.assigneeIds.includes(user.id)
              ? 'ring-2 ring-ring'
              : 'opacity-70 hover:opacity-100',
          )}
        >
          <Avatar className="size-6">
            <AvatarImage src={user.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="text-[10px]">{user.name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </button>
      ))}

      <Button
        variant={filter.overdue ? 'secondary' : 'ghost'}
        size="sm"
        aria-pressed={filter.overdue}
        className="h-7 text-xs"
        onClick={() => onChange({ ...filter, overdue: !filter.overdue })}
      >
        <ClockIcon className="size-3.5" />
        Atrasados
      </Button>

      {active && (
        <div className="ml-auto flex items-center gap-1.5">
          <span aria-live="polite" className="text-xs tabular-nums text-muted-foreground">
            {visible} de {total} cards
          </span>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              onChange(EMPTY_FILTER)
              field.current?.focus()
            }}
          >
            <XIcon className="size-3.5" />
            Limpar
          </Button>
        </div>
      )}
    </div>
  )
}
