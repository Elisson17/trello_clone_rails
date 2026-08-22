import type { BoardBackground } from '@/types/inertia'

export const BOARD_THEME: Record<BoardBackground, { chip: string; rail: string }> = {
  slate: { chip: 'bg-slate-500/15 text-slate-700 dark:text-slate-300', rail: 'bg-slate-500' },
  rose: { chip: 'bg-rose-500/15 text-rose-700 dark:text-rose-300', rail: 'bg-rose-500' },
  amber: { chip: 'bg-amber-500/15 text-amber-700 dark:text-amber-300', rail: 'bg-amber-500' },
  emerald: {
    chip: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    rail: 'bg-emerald-500',
  },
  sky: { chip: 'bg-sky-500/15 text-sky-700 dark:text-sky-300', rail: 'bg-sky-500' },
  violet: { chip: 'bg-violet-500/15 text-violet-700 dark:text-violet-300', rail: 'bg-violet-500' },
}

export const BACKGROUND_LABELS: Record<BoardBackground, string> = {
  slate: 'Cinza',
  rose: 'Rosa',
  amber: 'Âmbar',
  emerald: 'Verde',
  sky: 'Azul',
  violet: 'Violeta',
}
