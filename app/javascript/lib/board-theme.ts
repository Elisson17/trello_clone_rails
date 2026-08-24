import type { BoardBackground } from '@/types/inertia'

/**
 * Os seis tokens da paleta em duas formas. `chip` é a pílula neutra da etiqueta e `dot` é
 * o marcador colorido dentro dela: quatro etiquetas num card viram quatro pontos, e não
 * quatro pílulas coloridas disputando a atenção do título. `rail` é a cor sólida, usada no
 * trilho do board, na bolinha de status da coluna e nas amostras dos seletores de cor.
 */
const CHIP = 'border-border bg-secondary text-secondary-foreground'

export const BOARD_THEME: Record<BoardBackground, { chip: string; dot: string; rail: string }> = {
  slate: { chip: CHIP, dot: 'bg-slate-500', rail: 'bg-slate-500' },
  rose: { chip: CHIP, dot: 'bg-rose-500', rail: 'bg-rose-500' },
  amber: { chip: CHIP, dot: 'bg-amber-500', rail: 'bg-amber-500' },
  emerald: { chip: CHIP, dot: 'bg-emerald-500', rail: 'bg-emerald-500' },
  sky: { chip: CHIP, dot: 'bg-sky-500', rail: 'bg-sky-500' },
  violet: { chip: CHIP, dot: 'bg-violet-500', rail: 'bg-violet-500' },
}

export const BACKGROUND_LABELS: Record<BoardBackground, string> = {
  slate: 'Cinza',
  rose: 'Rosa',
  amber: 'Âmbar',
  emerald: 'Verde',
  sky: 'Azul',
  violet: 'Violeta',
}
