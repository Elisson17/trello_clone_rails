import { router } from '@inertiajs/react'
import { useEffect, useState } from 'react'

import type { BoardPayload, ListPayload } from '@/types/inertia'

/**
 * Estado otimista do board durante o drag.
 *
 * O rascunho local manda enquanto existe; qualquer prop nova vinda do servidor o apaga.
 * Se o move deu certo, os props novos são idênticos ao rascunho e a troca é invisível;
 * se deu errado, o card volta sozinho para o lugar de origem.
 */
export function useOptimisticMove(board: BoardPayload) {
  const [draft, setDraft] = useState<ListPayload[] | null>(null)

  // `board.lists` só muda de identidade quando o Inertia entrega props novos.
  // biome-ignore lint/correctness/useExhaustiveDependencies: a identidade do array é o sinal
  useEffect(() => setDraft(null), [board.lists])

  const lists = draft ?? board.lists

  function commit(next: ListPayload[], request: () => void) {
    setDraft(next)
    request()
  }

  function moveCard(next: ListPayload[], cardId: number, listId: number, index: number) {
    commit(next, () =>
      router.patch(
        `/cards/${cardId}/position`,
        { list_id: listId, index },
        { preserveScroll: true, preserveState: true },
      ),
    )
  }

  function moveList(next: ListPayload[], listId: number, index: number) {
    commit(next, () =>
      router.patch(
        `/boards/${board.id}/lists/${listId}/position`,
        { index },
        { preserveScroll: true, preserveState: true },
      ),
    )
  }

  return { lists, setDraft, moveCard, moveList }
}
