import type { ListPayload } from '@/types/inertia'

export const listOfCard = (lists: ListPayload[], cardId: number) =>
  lists.find((list) => list.cards.some((card) => card.id === cardId))

export const indexOfCard = (list: ListPayload, cardId: number) =>
  list.cards.findIndex((card) => card.id === cardId)

function insertAt<T>(items: T[], index: number, item: T): T[] {
  const at = Math.max(0, Math.min(index, items.length))

  return [...items.slice(0, at), item, ...items.slice(at)]
}

/** Move o card para `toIndex` dentro de `toListId`, tirando-o de onde estiver. */
export function moveCard(
  lists: ListPayload[],
  cardId: number,
  toListId: number,
  toIndex: number,
): ListPayload[] {
  const card = listOfCard(lists, cardId)?.cards.find((c) => c.id === cardId)
  if (!card) return lists

  return lists.map((list) => {
    const without = list.cards.filter((c) => c.id !== cardId)
    if (list.id !== toListId)
      return without.length === list.cards.length ? list : { ...list, cards: without }

    return { ...list, cards: insertAt(without, toIndex, card) }
  })
}

/** Reordena a lista para `toIndex` entre as outras listas do board. */
export function moveList(lists: ListPayload[], listId: number, toIndex: number): ListPayload[] {
  const from = lists.findIndex((list) => list.id === listId)
  if (from === -1) return lists

  const without = lists.filter((list) => list.id !== listId)
  return insertAt(without, toIndex, lists[from])
}
