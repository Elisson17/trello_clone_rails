import type { BoardCardPayload } from '@/types/inertia'

export type BoardsSort = 'recent' | 'name' | 'updated'

export type BoardsFilter = {
  text: string
  workspaceSlugs: string[]
  /** Boards em que eu sou o dono. */
  mineOnly: boolean
  sort: BoardsSort
}

export const EMPTY_BOARDS_FILTER: BoardsFilter = {
  text: '',
  workspaceSlugs: [],
  mineOnly: false,
  sort: 'recent',
}

/** Ordenação não conta: ela não esconde nada, então não é o que o "limpar" desfaz. */
export const isFilteringBoards = (filter: BoardsFilter) =>
  filter.text.trim() !== '' || filter.workspaceSlugs.length > 0 || filter.mineOnly

const time = (value: string | null) => (value ? Date.parse(value) : 0)

const compare: Record<BoardsSort, (a: BoardCardPayload, b: BoardCardPayload) => number> = {
  // Nunca visitado tem 0 e cai para o fim, que é onde ele pertence numa lista de "recentes".
  recent: (a, b) => time(b.last_visited_at) - time(a.last_visited_at),
  name: (a, b) => a.title.localeCompare(b.title, 'pt-BR'),
  updated: (a, b) => time(b.updated_at) - time(a.updated_at),
}

export function filterBoards(
  boards: BoardCardPayload[],
  filter: BoardsFilter,
  currentUserId: number,
): BoardCardPayload[] {
  const text = filter.text.trim().toLowerCase()

  const found = boards.filter((board) => {
    if (text && !`${board.title} ${board.workspace.name}`.toLowerCase().includes(text)) return false
    if (filter.mineOnly && board.owner.id !== currentUserId) return false

    return (
      filter.workspaceSlugs.length === 0 || filter.workspaceSlugs.includes(board.workspace.slug)
    )
  })

  return found.sort(compare[filter.sort])
}

export const toggleSlug = (slugs: string[], slug: string) =>
  slugs.includes(slug) ? slugs.filter((current) => current !== slug) : [...slugs, slug]
