import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import type { BoardCardPayload } from '@/types/inertia'
import BoardsIndex from './Index'

const shared = vi.hoisted(() => ({
  props: {
    auth: { user: { id: 7, name: 'Ana', email: 'a@b.c', time_zone: 'UTC', avatar_url: null } },
    nav: {
      workspaces: [
        { slug: 'produto', name: 'Produto' },
        { slug: 'pessoal', name: 'Pessoal' },
      ],
      recent_boards: [],
    },
  },
}))

vi.mock('@inertiajs/react', () => ({
  Head: () => null,
  Link: ({ children, ...props }: { children?: ReactNode }) => <a {...props}>{children}</a>,
  usePage: () => ({ props: shared.props, url: '/' }),
  router: { delete: vi.fn(), patch: vi.fn() },
  useForm: () => ({
    data: { title: '', name: '', background: 'slate', visibility: 'workspace_wide', workspace: '' },
    errors: {},
    processing: false,
    setData: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    reset: vi.fn(),
  }),
}))

const board = (overrides: Partial<BoardCardPayload> = {}): BoardCardPayload => ({
  id: 1,
  title: 'Roadmap',
  background: 'slate',
  visibility: 'workspace_wide',
  updated_at: '2026-08-20T10:00:00Z',
  workspace: { slug: 'produto', name: 'Produto' },
  owner: { id: 7, name: 'Ana', avatar_url: null },
  last_visited_at: '2026-08-23T10:00:00Z',
  members: { avatars: [], total: 1 },
  preview: [],
  counts: { lists: 0, cards: 0, overdue: 0 },
  ...overrides,
})

const backgrounds = ['slate', 'rose'] as const

describe('Boards/Index', () => {
  it('renders one card per board', () => {
    render(
      <BoardsIndex
        boards={[board(), board({ id: 2, title: 'Backlog' })]}
        backgrounds={[...backgrounds]}
      />,
    )

    expect(screen.getByRole('link', { name: /Roadmap/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Backlog/ })).toBeInTheDocument()
  })

  it('narrows the grid as you type', () => {
    render(
      <BoardsIndex
        boards={[board(), board({ id: 2, title: 'Backlog' })]}
        backgrounds={[...backgrounds]}
      />,
    )

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'back' } })

    expect(screen.queryByRole('link', { name: /Roadmap/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Backlog/ })).toBeInTheDocument()
  })

  it('says when the filter found nothing, without pretending the person has no boards', () => {
    render(<BoardsIndex boards={[board()]} backgrounds={[...backgrounds]} />)

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } })

    expect(screen.getByText('Nenhum board com esse filtro')).toBeInTheDocument()
  })

  it('invites the person to create the first board when there is none', () => {
    render(<BoardsIndex boards={[]} backgrounds={[...backgrounds]} />)

    expect(screen.getByText('Nenhum board ainda')).toBeInTheDocument()
  })

  it('keeps only my boards when the toggle is on', () => {
    const boards = [
      board(),
      board({ id: 2, title: 'Backlog', owner: { id: 9, name: 'Bia', avatar_url: null } }),
    ]
    render(<BoardsIndex boards={boards} backgrounds={[...backgrounds]} />)

    fireEvent.click(screen.getByRole('button', { name: 'Só meus' }))

    expect(screen.queryByRole('link', { name: /Backlog/ })).not.toBeInTheDocument()
  })

  // Dentro do workspace o chip repetiria a única resposta possível.
  it('drops the workspace chips inside a workspace', () => {
    const workspace = {
      id: 1,
      slug: 'produto',
      name: 'Produto',
      personal: false,
      members_count: 1,
      role: 'owner' as const,
      membership_id: 3,
      members_preview: [],
    }

    render(
      <BoardsIndex
        boards={[board()]}
        backgrounds={[...backgrounds]}
        workspace={workspace}
        can={{
          update: true,
          destroy: true,
          manage_members: true,
          leave: true,
          create_board: true,
        }}
        archived_count={0}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Produto' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pessoal' })).not.toBeInTheDocument()
  })
})
