import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/** "há 2 minutos", com unidade e plural resolvidos pelo `date-fns`. */
export const relativeTime = (iso: string) =>
  formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR })

const unit = (unit: 'kilobyte' | 'megabyte', digits: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'unit', unit, maximumFractionDigits: digits })

/** `Intl` já escreve "1,4 MB" em pt-BR, sem switch de potências de 1024. */
export const humanSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? unit('kilobyte', 0).format(bytes / 1024)
    : unit('megabyte', 1).format(bytes / 1024 / 1024)

const pad = (value: number) => String(value).padStart(2, '0')

/** `<input type="datetime-local">` fala no fuso do navegador; o payload chega em UTC. */
export const toLocalInput = (iso: string | null) => {
  if (!iso) return ''
  const date = new Date(iso)

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
