import { describe, expect, it } from 'vitest'
import type { CardPayload, LabelPayload, ListPayload } from '@/types/inertia'
import { countCards, EMPTY_FILTER, filterLists, isFiltering, toggleId } from './board-filter'

const label = (id: number): LabelPayload => ({ id, name: `Label ${id}`, color: 'sky' })

const card = (id: number, attrs: Partial<CardPayload> = {}): CardPayload => ({
  id,
  title: `Card ${id}`,
  position: id * 1024,
  due_at: null,
  completed: false,
  overdue: false,
  cover_color: null,
  attachments_count: 0,
  has_description: false,
  labels: [],
  assignees: [],
  checklist: null,
  comments_count: 0,
  ...attrs,
})

const list = (cards: CardPayload[]): ListPayload[] => [
  { id: 1, title: 'Lista 1', position: 1024, cards },
]

const ids = (lists: ListPayload[]) => lists.flatMap((item) => item.cards.map((c) => c.id))

describe('isFiltering', () => {
  it('is off with an empty filter', () => {
    expect(isFiltering(EMPTY_FILTER)).toBe(false)
  })

  it('is off for whitespace typed in the text field', () => {
    expect(isFiltering({ ...EMPTY_FILTER, text: '   ' })).toBe(false)
  })

  it('is on with a label selected', () => {
    expect(isFiltering({ ...EMPTY_FILTER, labelIds: [1] })).toBe(true)
  })
})

describe('filterLists', () => {
  it('returns the same lists when nothing is filtered', () => {
    const lists = list([card(1)])

    expect(filterLists(lists, EMPTY_FILTER)).toBe(lists)
  })

  it('keeps only the cards matching the text', () => {
    const lists = list([card(1, { title: 'Revisar contrato' }), card(2, { title: 'Deploy' })])

    expect(ids(filterLists(lists, { ...EMPTY_FILTER, text: 'contra' }))).toEqual([1])
  })

  it('ignores case in the text', () => {
    const lists = list([card(1, { title: 'Revisar Contrato' })])

    expect(ids(filterLists(lists, { ...EMPTY_FILTER, text: 'CONTRATO' }))).toEqual([1])
  })

  it('keeps the empty list on the board', () => {
    const lists = list([card(1, { title: 'Deploy' })])

    expect(filterLists(lists, { ...EMPTY_FILTER, text: 'nada' })).toHaveLength(1)
  })

  it('keeps a card carrying any of the selected labels', () => {
    const lists = list([card(1, { labels: [label(9)] }), card(2, { labels: [label(8)] })])

    expect(ids(filterLists(lists, { ...EMPTY_FILTER, labelIds: [9, 7] }))).toEqual([1])
  })

  it('keeps a card assigned to any of the selected people', () => {
    const lists = list([
      card(1, { assignees: [{ id: 5, name: 'Ana', avatar_url: null }] }),
      card(2),
    ])

    expect(ids(filterLists(lists, { ...EMPTY_FILTER, assigneeIds: [5] }))).toEqual([1])
  })

  it('keeps only overdue cards when asked', () => {
    const lists = list([card(1, { overdue: true }), card(2)])

    expect(ids(filterLists(lists, { ...EMPTY_FILTER, overdue: true }))).toEqual([1])
  })

  it('narrows when two different criteria are on', () => {
    const lists = list([card(1, { overdue: true, labels: [label(9)] }), card(2, { overdue: true })])

    expect(ids(filterLists(lists, { ...EMPTY_FILTER, overdue: true, labelIds: [9] }))).toEqual([1])
  })
})

describe('countCards', () => {
  it('adds up the cards of every list', () => {
    expect(countCards([...list([card(1), card(2)]), ...list([card(3)])])).toBe(3)
  })
})

describe('toggleId', () => {
  it('adds an id that was not selected', () => {
    expect(toggleId([1], 2)).toEqual([1, 2])
  })

  it('removes an id that was selected', () => {
    expect(toggleId([1, 2], 1)).toEqual([2])
  })
})
