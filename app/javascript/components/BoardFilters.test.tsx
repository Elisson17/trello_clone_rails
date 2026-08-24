import { render, screen } from '@testing-library/react'

import { EMPTY_FILTER } from '@/lib/board-filter'
import type { BoardPayload } from '@/types/inertia'

import { BoardFilters } from './BoardFilters'

const board = {
  id: 1,
  title: 'Roadmap',
  description: null,
  visibility: 'workspace_wide',
  background: 'sky',
  archived: false,
  workspace: { slug: 'produto', name: 'Produto' },
  members: [],
  workspace_members: [],
  labels: [{ id: 5, name: 'bug', color: 'rose' }],
  lists: [],
  cards_count: 0,
} as unknown as BoardPayload

describe('BoardFilters', () => {
  it('carries the label color in a dot instead of the whole chip', () => {
    render(
      <BoardFilters
        board={board}
        filter={EMPTY_FILTER}
        onChange={() => {}}
        visible={0}
        total={0}
      />,
    )

    const chip = screen.getByRole('button', { name: 'bug' })

    expect(chip.querySelector('[data-label-dot]')).toHaveClass('bg-rose-500')
  })

  it('keeps the dot when the label is an active filter', () => {
    render(
      <BoardFilters
        board={board}
        filter={{ ...EMPTY_FILTER, labelIds: [5] }}
        onChange={() => {}}
        visible={0}
        total={0}
      />,
    )

    const chip = screen.getByRole('button', { name: 'bug' })

    expect(chip.querySelector('[data-label-dot]')).toHaveClass('bg-rose-500')
  })

  it('says which labels are on through aria-pressed', () => {
    render(
      <BoardFilters
        board={board}
        filter={{ ...EMPTY_FILTER, labelIds: [5] }}
        onChange={() => {}}
        visible={0}
        total={0}
      />,
    )

    expect(screen.getByRole('button', { name: 'bug' })).toHaveAttribute('aria-pressed', 'true')
  })
})
