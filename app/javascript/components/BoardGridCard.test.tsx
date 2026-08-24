import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { BoardCardPayload } from '@/types/inertia'
import { BoardGridCard } from './BoardGridCard'

vi.mock('@inertiajs/react', () => ({
  Link: ({ children, ...props }: { children?: ReactNode }) => <a {...props}>{children}</a>,
}))

const board: BoardCardPayload = {
  id: 3,
  title: 'Roadmap',
  background: 'sky',
  visibility: 'workspace_wide',
  updated_at: '2026-08-20T10:00:00Z',
  workspace: { slug: 'produto', name: 'Produto' },
  owner: { id: 7, name: 'Ana', avatar_url: null },
  last_visited_at: null,
  members: { avatars: [{ id: 7, name: 'Ana', avatar_url: null }], total: 4 },
  preview: [
    { list_id: 1, count: 3, colors: ['rose'] },
    { list_id: 2, count: 0, colors: [] },
  ],
  counts: { lists: 2, cards: 3, overdue: 1 },
}

describe('BoardGridCard', () => {
  it('links to the board', () => {
    render(<BoardGridCard board={board} showWorkspace />)

    expect(screen.getByRole('link', { name: /Roadmap/ })).toHaveAttribute('href', '/boards/3')
  })

  it('names the workspace when the grid spans more than one', () => {
    render(<BoardGridCard board={board} showWorkspace />)

    expect(screen.getByText('Produto')).toBeInTheDocument()
  })

  it('hides the workspace inside a workspace page, where it would repeat', () => {
    render(<BoardGridCard board={board} showWorkspace={false} />)

    expect(screen.queryByText('Produto')).not.toBeInTheDocument()
  })

  it('says it was never opened', () => {
    render(<BoardGridCard board={board} showWorkspace />)

    expect(screen.getByText('nunca aberto')).toBeInTheDocument()
  })

  it('shows the overdue count only when there is one', () => {
    const { rerender } = render(<BoardGridCard board={board} showWorkspace />)
    expect(screen.getByText('1 atrasado')).toBeInTheDocument()

    rerender(
      <BoardGridCard board={{ ...board, counts: { ...board.counts, overdue: 0 } }} showWorkspace />,
    )
    expect(screen.queryByText(/atrasado/)).not.toBeInTheDocument()
  })

  // O preview é decoração informativa: leitor de tela lê os números, não as barras.
  it('keeps the preview out of the accessibility tree', () => {
    const { container } = render(<BoardGridCard board={board} showWorkspace />)

    expect(container.querySelector('[data-preview]')).toHaveAttribute('aria-hidden')
  })
})
