import { describe, expect, it } from 'vitest'
import type { BoardCardPayload } from '@/types/inertia'
import { EMPTY_BOARDS_FILTER, filterBoards, isFilteringBoards, toggleSlug } from './boards-filter'

const board = (overrides: Partial<BoardCardPayload> = {}): BoardCardPayload => ({
  id: 1,
  title: 'Roadmap',
  background: 'slate',
  visibility: 'workspace_wide',
  updated_at: '2026-08-20T10:00:00Z',
  workspace: { slug: 'produto', name: 'Produto' },
  owner: { id: 7, name: 'Ana', avatar_url: null },
  last_visited_at: null,
  members: { avatars: [], total: 1 },
  preview: [],
  counts: { lists: 0, cards: 0, overdue: 0 },
  ...overrides,
})

describe('filterBoards', () => {
  it('returns everything when nothing is filtering', () => {
    const boards = [board(), board({ id: 2 })]

    expect(filterBoards(boards, EMPTY_BOARDS_FILTER, 7)).toHaveLength(2)
  })

  it('matches the board title', () => {
    const boards = [board({ title: 'Roadmap' }), board({ id: 2, title: 'Backlog' })]

    const found = filterBoards(boards, { ...EMPTY_BOARDS_FILTER, text: 'road' }, 7)

    expect(found.map((item) => item.title)).toEqual(['Roadmap'])
  })

  it('also matches the workspace name', () => {
    const boards = [board({ workspace: { slug: 'pessoal', name: 'Pessoal' } }), board({ id: 2 })]

    const found = filterBoards(boards, { ...EMPTY_BOARDS_FILTER, text: 'pessoal' }, 7)

    expect(found.map((item) => item.id)).toEqual([1])
  })

  it('takes the union of the selected workspaces', () => {
    const boards = [
      board({ workspace: { slug: 'produto', name: 'Produto' } }),
      board({ id: 2, workspace: { slug: 'pessoal', name: 'Pessoal' } }),
      board({ id: 3, workspace: { slug: 'outro', name: 'Outro' } }),
    ]

    const found = filterBoards(
      boards,
      { ...EMPTY_BOARDS_FILTER, workspaceSlugs: ['produto', 'pessoal'] },
      7,
    )

    expect(found.map((item) => item.id)).toEqual([1, 2])
  })

  it('keeps only my boards when asked', () => {
    const boards = [board(), board({ id: 2, owner: { id: 9, name: 'Bia', avatar_url: null } })]

    const found = filterBoards(boards, { ...EMPTY_BOARDS_FILTER, mineOnly: true }, 7)

    expect(found.map((item) => item.id)).toEqual([1])
  })

  // Nunca visitado vai para o fim: a ordenação é "onde eu estive", e nunca é o oposto de agora.
  it('sorts by last visit and sends the never visited to the end', () => {
    const boards = [
      board({ id: 1, last_visited_at: null }),
      board({ id: 2, last_visited_at: '2026-08-01T10:00:00Z' }),
      board({ id: 3, last_visited_at: '2026-08-22T10:00:00Z' }),
    ]

    const found = filterBoards(boards, EMPTY_BOARDS_FILTER, 7)

    expect(found.map((item) => item.id)).toEqual([3, 2, 1])
  })

  it('sorts by name', () => {
    const boards = [board({ id: 1, title: 'Zebra' }), board({ id: 2, title: 'Alpha' })]

    const found = filterBoards(boards, { ...EMPTY_BOARDS_FILTER, sort: 'name' }, 7)

    expect(found.map((item) => item.title)).toEqual(['Alpha', 'Zebra'])
  })

  it('sorts by most recently updated', () => {
    const boards = [
      board({ id: 1, updated_at: '2026-08-01T10:00:00Z' }),
      board({ id: 2, updated_at: '2026-08-23T10:00:00Z' }),
    ]

    const found = filterBoards(boards, { ...EMPTY_BOARDS_FILTER, sort: 'updated' }, 7)

    expect(found.map((item) => item.id)).toEqual([2, 1])
  })

  it('never mutates the array it receives', () => {
    const boards = [board({ id: 1, title: 'Zebra' }), board({ id: 2, title: 'Alpha' })]

    filterBoards(boards, { ...EMPTY_BOARDS_FILTER, sort: 'name' }, 7)

    expect(boards.map((item) => item.id)).toEqual([1, 2])
  })
})

describe('isFilteringBoards', () => {
  it('is false for the empty filter', () => {
    expect(isFilteringBoards(EMPTY_BOARDS_FILTER)).toBe(false)
  })

  // Ordenação não é filtro: mudar a ordem não deve acender o botão de limpar.
  it('ignores the sort', () => {
    expect(isFilteringBoards({ ...EMPTY_BOARDS_FILTER, sort: 'name' })).toBe(false)
  })

  it('is true with text', () => {
    expect(isFilteringBoards({ ...EMPTY_BOARDS_FILTER, text: 'road' })).toBe(true)
  })
})

describe('toggleSlug', () => {
  it('adds what is missing and removes what is there', () => {
    expect(toggleSlug([], 'produto')).toEqual(['produto'])
    expect(toggleSlug(['produto'], 'produto')).toEqual([])
  })
})
