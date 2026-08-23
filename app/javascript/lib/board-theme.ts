import type { BoardBackground } from '@/types/inertia'

/**
 * Os seis tokens da paleta, em duas formas: `chip` é a pílula de etiqueta no estilo do
 * GitHub (borda e texto na cor, fundo translúcido) e `rail` é a cor sólida — serve de
 * trilho do board, de bolinha de status da coluna e de amostra nos seletores de cor.
 */
export const BOARD_THEME: Record<BoardBackground, { chip: string; rail: string }> = {
  slate: {
    chip: 'border-slate-500/40 bg-slate-500/15 text-slate-700 dark:text-slate-300',
    rail: 'bg-slate-500',
  },
  rose: {
    chip: 'border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300',
    rail: 'bg-rose-500',
  },
  amber: {
    chip: 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300',
    rail: 'bg-amber-500',
  },
  emerald: {
    chip: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    rail: 'bg-emerald-500',
  },
  sky: {
    chip: 'border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-300',
    rail: 'bg-sky-500',
  },
  violet: {
    chip: 'border-violet-500/40 bg-violet-500/15 text-violet-700 dark:text-violet-300',
    rail: 'bg-violet-500',
  },
}

export const BACKGROUND_LABELS: Record<BoardBackground, string> = {
  slate: 'Cinza',
  rose: 'Rosa',
  amber: 'Âmbar',
  emerald: 'Verde',
  sky: 'Azul',
  violet: 'Violeta',
}
