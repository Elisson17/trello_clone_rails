import { SettingsIcon } from 'lucide-react'
import { RailTrigger } from '@/components/card/RailTrigger'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { BACKGROUND_LABELS, BOARD_THEME } from '@/lib/board-theme'
import { cn } from '@/lib/utils'
import type { BoardBackground } from '@/types/inertia'

const COLORS = Object.keys(BOARD_THEME) as BoardBackground[]

export function CoverPicker({
  cover,
  onPick,
}: {
  cover: BoardBackground | null
  onPick: (color: string | null) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <RailTrigger label="Escolher a capa">
          <SettingsIcon />
        </RailTrigger>
      </PopoverTrigger>

      <PopoverContent className="w-56" align="end">
        <div className="flex flex-wrap gap-1">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={BACKGROUND_LABELS[color]}
              aria-pressed={cover === color}
              className={cn(
                'size-7 rounded-sm ring-offset-2 ring-offset-popover transition-shadow',
                BOARD_THEME[color].rail,
                cover === color && 'ring-2 ring-ring',
              )}
              onClick={() => onPick(color)}
            />
          ))}
        </div>

        <button
          type="button"
          className="mt-2 w-full rounded-sm px-1 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={() => onPick(null)}
        >
          Sem capa
        </button>
      </PopoverContent>
    </Popover>
  )
}
