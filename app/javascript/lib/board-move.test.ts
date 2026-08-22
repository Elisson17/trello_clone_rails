import { describe, expect, it } from 'vitest'
import type { CardPayload, ListPayload } from '@/types/inertia'
import { indexOfCard, listOfCard, moveCard, moveList } from './board-move'

const card = (id: number): CardPayload => ({
  id,
  title: `Card ${id}`,
  position: id * 1024,
  due_at: null,
  completed: false,
  overdue: false,
  cover_color: null,
  comments_count: 0,
})

const list = (id: number, cards: number[]): ListPayload => ({
  id,
  title: `Lista ${id}`,
  position: id * 1024,
  cards: cards.map(card),
})

const ids = (lists: ListPayload[]) => lists.map((l) => l.cards.map((c) => c.id))

describe('moveCard', () => {
  const board = [list(1, [10, 11, 12]), list(2, [20])]

  it('reordena dentro da própria lista', () => {
    expect(ids(moveCard(board, 10, 1, 2))).toEqual([[11, 12, 10], [20]])
  })

  it('move para outra lista na posição pedida', () => {
    expect(ids(moveCard(board, 11, 2, 0))).toEqual([
      [10, 12],
      [11, 20],
    ])
  })

  it('grampeia um índice maior que a lista de destino', () => {
    expect(ids(moveCard(board, 10, 2, 99))).toEqual([
      [11, 12],
      [20, 10],
    ])
  })

  it('devolve o board intacto quando o card não existe', () => {
    expect(moveCard(board, 999, 1, 0)).toBe(board)
  })

  it('não recria as listas que não foram tocadas', () => {
    expect(moveCard(board, 10, 1, 2)[1]).toBe(board[1])
  })
})

describe('moveList', () => {
  const board = [list(1, []), list(2, []), list(3, [])]

  it('reordena as listas', () => {
    expect(moveList(board, 1, 2).map((l) => l.id)).toEqual([2, 3, 1])
  })

  it('leva a lista para o começo', () => {
    expect(moveList(board, 3, 0).map((l) => l.id)).toEqual([3, 1, 2])
  })
})

describe('buscas', () => {
  const board = [list(1, [10, 11]), list(2, [20])]

  it('acha a lista de um card', () => {
    expect(listOfCard(board, 20)?.id).toBe(2)
    expect(listOfCard(board, 99)).toBeUndefined()
  })

  it('acha o índice do card na lista', () => {
    expect(indexOfCard(board[0], 11)).toBe(1)
    expect(indexOfCard(board[0], 99)).toBe(-1)
  })
})
