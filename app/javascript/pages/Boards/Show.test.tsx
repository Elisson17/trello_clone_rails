import { fireEvent, render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'

import BoardShow from './Show'

const router = vi.hoisted(() => ({ post: vi.fn(), patch: vi.fn(), delete: vi.fn() }))
const form = vi.hoisted(() => ({
  data: { title: '' },
  errors: {} as Record<string, string>,
  processing: false,
  setData: vi.fn(),
  transform: vi.fn(),
  post: vi.fn(),
  reset: vi.fn(),
}))

vi.mock('@inertiajs/react', () => ({
  Head: () => null,
  Link: ({ children, ...props }: { children?: ReactNode }) => <a {...props}>{children}</a>,
  router,
  useForm: () => form,
}))

const card = {
  id: 5,
  title: 'Escrever o README',
  position: 1024,
  due_at: null,
  completed: false,
  overdue: false,
  cover_color: null,
  comments_count: 0,
}

const board = {
  id: 1,
  title: 'Roadmap',
  description: null,
  visibility: 'workspace_wide' as const,
  background: 'sky' as const,
  archived: false,
  workspace: { slug: 'time', name: 'Time' },
  lists: [
    { id: 10, title: 'A fazer', position: 1024, cards: [card] },
    { id: 11, title: 'Feito', position: 2048, cards: [] },
  ],
  cards_count: 1,
}

const can = { update: true, destroy: true, archive: true }

function renderBoard(overrides: Partial<Parameters<typeof BoardShow>[0]> = {}) {
  return render(<BoardShow board={board} can={can} {...overrides} />)
}

beforeEach(() => {
  vi.clearAllMocks()
  form.data.title = ''
})

describe('Boards/Show', () => {
  it('renders every list with its cards', () => {
    renderBoard()

    expect(screen.getByText('A fazer')).toBeInTheDocument()
    expect(screen.getByText('Feito')).toBeInTheDocument()
    expect(screen.getByText('Escrever o README')).toBeInTheDocument()
  })

  it('creates a card inline without leaving the board', () => {
    form.data.title = 'Novo card'
    renderBoard()

    const column = screen.getByText('A fazer').closest('section') as HTMLElement
    fireEvent.click(within(column).getByRole('button', { name: 'Adicionar card' }))
    fireEvent.submit(
      within(column).getByLabelText('Adicionar card').closest('form') as HTMLFormElement,
    )

    expect(form.post).toHaveBeenCalledWith('/cards', expect.anything())
  })

  it('does not submit an empty inline add', () => {
    renderBoard()

    const column = screen.getByText('A fazer').closest('section') as HTMLElement
    fireEvent.click(within(column).getByRole('button', { name: 'Adicionar card' }))
    fireEvent.submit(
      within(column).getByLabelText('Adicionar card').closest('form') as HTMLFormElement,
    )

    expect(form.post).not.toHaveBeenCalled()
  })

  it('completes a card from the board', () => {
    renderBoard()

    fireEvent.click(screen.getByRole('button', { name: 'Concluir Escrever o README' }))

    expect(router.post).toHaveBeenCalledWith('/cards/5/completion', {}, { preserveScroll: true })
  })

  it('reopens a completed card', () => {
    renderBoard({
      board: { ...board, lists: [{ ...board.lists[0], cards: [{ ...card, completed: true }] }] },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Reabrir Escrever o README' }))

    expect(router.delete).toHaveBeenCalledWith('/cards/5/completion', { preserveScroll: true })
  })

  it('renames a list in place', () => {
    renderBoard()

    fireEvent.click(screen.getByRole('button', { name: 'A fazer' }))
    const field = screen.getByLabelText('Renomear A fazer')
    fireEvent.change(field, { target: { value: 'Backlog' } })
    fireEvent.blur(field)

    expect(router.patch).toHaveBeenCalledWith(
      '/boards/1/lists/10',
      { title: 'Backlog' },
      { preserveScroll: true, preserveState: true },
    )
  })

  it('does not save a rename that changed nothing', () => {
    renderBoard()

    fireEvent.click(screen.getByRole('button', { name: 'A fazer' }))
    fireEvent.blur(screen.getByLabelText('Renomear A fazer'))

    expect(router.patch).not.toHaveBeenCalled()
  })

  it('hides every write affordance from a viewer', () => {
    renderBoard({ can: { update: false, destroy: false, archive: false } })

    expect(screen.queryByRole('button', { name: 'Adicionar lista' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Adicionar card/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Concluir/ })).not.toBeInTheDocument()
    expect(screen.getByText('Escrever o README')).toBeInTheDocument()
  })
})
