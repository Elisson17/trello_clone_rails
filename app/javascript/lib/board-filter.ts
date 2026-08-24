import type { CardPayload, ListPayload } from '@/types/inertia'

export type BoardFilter = {
  text: string
  labelIds: number[]
  assigneeIds: number[]
  /** Só cards com prazo vencido e não concluídos — é o `overdue?` do servidor. */
  overdue: boolean
}

export const EMPTY_FILTER: BoardFilter = {
  text: '',
  labelIds: [],
  assigneeIds: [],
  overdue: false,
}

export const isFiltering = (filter: BoardFilter) =>
  filter.text.trim() !== '' ||
  filter.labelIds.length > 0 ||
  filter.assigneeIds.length > 0 ||
  filter.overdue

// Etiqueta e responsável são OU dentro do próprio critério e E entre critérios: marcar duas
// etiquetas alarga, marcar etiqueta e responsável estreita. É o que o Trello faz.
function matches(card: CardPayload, filter: BoardFilter, text: string) {
  if (text && !card.title.toLowerCase().includes(text)) return false
  if (filter.overdue && !card.overdue) return false

  if (
    filter.labelIds.length > 0 &&
    !card.labels.some((label) => filter.labelIds.includes(label.id))
  )
    return false

  return (
    filter.assigneeIds.length === 0 ||
    card.assignees.some((user) => filter.assigneeIds.includes(user.id))
  )
}

/** As colunas continuam todas na tela: filtro esconde card, não esconde lista. */
export function filterLists(lists: ListPayload[], filter: BoardFilter): ListPayload[] {
  if (!isFiltering(filter)) return lists
  const text = filter.text.trim().toLowerCase()

  return lists.map((list) => ({
    ...list,
    cards: list.cards.filter((card) => matches(card, filter, text)),
  }))
}

export const countCards = (lists: ListPayload[]) =>
  lists.reduce((total, list) => total + list.cards.length, 0)

/** Liga/desliga um id numa das listas de ids do filtro. */
export const toggleId = (ids: number[], id: number) =>
  ids.includes(id) ? ids.filter((current) => current !== id) : [...ids, id]
