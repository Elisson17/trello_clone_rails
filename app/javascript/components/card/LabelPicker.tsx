import { router, useForm } from '@inertiajs/react'
import { CheckIcon, SettingsIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

import { RailTrigger } from '@/components/card/RailTrigger'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { BACKGROUND_LABELS, BOARD_THEME } from '@/lib/board-theme'
import { cn } from '@/lib/utils'
import type { BoardBackground, BoardPayload, LabelPayload } from '@/types/inertia'

const COLORS = Object.keys(BOARD_THEME) as BoardBackground[]

export function LabelChips({ labels, className }: { labels: LabelPayload[]; className?: string }) {
  if (labels.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {labels.map((label) => (
        <span
          key={label.id}
          className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
            BOARD_THEME[label.color].chip,
          )}
        >
          {label.name}
        </span>
      ))}
    </div>
  )
}

export function LabelPicker({
  board,
  cardId,
  selected,
}: {
  board: BoardPayload
  cardId: number
  selected: number[]
}) {
  const [color, setColor] = useState<BoardBackground>('sky')
  const form = useForm<{ name: string; color: BoardBackground }>({ name: '', color: 'sky' })

  function toggle(label: LabelPayload) {
    const on = selected.includes(label.id)

    // Marcar é criar a ligação, desmarcar é apagá-la: o `:id` da rota é o da label.
    if (on) return router.delete(`/cards/${cardId}/labels/${label.id}`, { preserveScroll: true })

    router.post(`/cards/${cardId}/labels`, { label_id: label.id }, { preserveScroll: true })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <RailTrigger label="Escolher etiquetas">
          <SettingsIcon />
        </RailTrigger>
      </PopoverTrigger>

      <PopoverContent align="end">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Etiquetas do board</p>

        <ul className="flex flex-col gap-1">
          {board.labels.map((label) => (
            <li key={label.id} className="group/label flex items-center gap-1">
              <button
                type="button"
                aria-pressed={selected.includes(label.id)}
                className={cn(
                  'flex flex-1 items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent',
                )}
                onClick={() => toggle(label)}
              >
                <span
                  aria-hidden
                  className={cn('size-3 rounded-sm', BOARD_THEME[label.color].rail)}
                />
                <span className="flex-1 truncate">{label.name}</span>
                {selected.includes(label.id) && <CheckIcon className="size-3.5" />}
              </button>

              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover/label:opacity-100"
                aria-label={`Excluir etiqueta ${label.name}`}
                onClick={() =>
                  router.delete(`/boards/${board.id}/labels/${label.id}`, { preserveScroll: true })
                }
              >
                <Trash2Icon className="size-3" />
              </Button>
            </li>
          ))}
        </ul>

        <form
          className="mt-3 flex flex-col gap-2 border-t pt-3"
          onSubmit={(event) => {
            event.preventDefault()
            if (!form.data.name.trim()) return

            form.transform((data) => ({ ...data, color }))
            form.post(`/boards/${board.id}/labels`, {
              preserveScroll: true,
              onSuccess: () => form.reset(),
            })
          }}
        >
          <Input
            aria-label="Nome da nova etiqueta"
            placeholder="Nova etiqueta"
            className="h-8"
            value={form.data.name}
            aria-invalid={!!form.errors.name || undefined}
            onChange={(event) => form.setData('name', event.target.value)}
          />

          <div className="flex gap-1">
            {COLORS.map((option) => (
              <button
                key={option}
                type="button"
                aria-label={BACKGROUND_LABELS[option]}
                aria-pressed={color === option}
                className={cn(
                  'size-6 rounded-sm ring-offset-2 ring-offset-popover transition-shadow',
                  BOARD_THEME[option].rail,
                  color === option && 'ring-2 ring-ring',
                )}
                onClick={() => setColor(option)}
              />
            ))}
          </div>

          {form.errors.name && (
            <span className="text-[12.5px] font-medium text-destructive">{form.errors.name}</span>
          )}

          <Button type="submit" size="sm" disabled={form.processing}>
            Criar etiqueta
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
