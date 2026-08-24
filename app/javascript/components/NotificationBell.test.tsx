import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import { NotificationBell } from './NotificationBell'

const shared = vi.hoisted(() => ({
  props: {} as { notifications?: { items: unknown[] } },
  reload: vi.fn(),
  patch: vi.fn(),
}))

vi.mock('@inertiajs/react', () => ({
  Link: ({ children, ...props }: { children?: ReactNode }) => <a {...props}>{children}</a>,
  usePage: () => ({ props: shared.props }),
  router: { reload: shared.reload, patch: shared.patch },
}))

const notification = (id: number, read = false) => ({
  id,
  read,
  created_at: '2026-08-24T10:00:00Z',
  board: { id: 1, title: 'Roadmap' },
  activity: {
    id,
    action: 'card.assigned',
    created_at: '2026-08-24T10:00:00Z',
    actor: { id: 2, name: 'Ana', avatar_url: null },
    url: '/cards/5',
    metadata: { title: 'Card' },
  },
})

beforeEach(() => {
  shared.props = {}
  shared.reload.mockClear()
  shared.patch.mockClear()
})

describe('NotificationBell', () => {
  it('shows the number of unread notifications', () => {
    render(<NotificationBell count={3} />)

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('caps the badge instead of widening the header', () => {
    render(<NotificationBell count={42} />)

    expect(screen.getByText('9+')).toBeInTheDocument()
  })

  it('says how many are unread to a screen reader', () => {
    render(<NotificationBell count={2} />)

    expect(screen.getByLabelText('Notificações (2 não lidas)')).toBeInTheDocument()
  })

  it('has no badge when there is nothing unread', () => {
    render(<NotificationBell count={0} />)

    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('asks the server for the list only when opened', () => {
    render(<NotificationBell count={1} />)
    expect(shared.reload).not.toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Notificações (1 não lida)'))

    expect(shared.reload).toHaveBeenCalledWith({ only: ['notifications'] })
  })

  it('lists what arrived', () => {
    shared.props = { notifications: { items: [notification(1)] } }
    render(<NotificationBell count={1} />)

    fireEvent.click(screen.getByLabelText('Notificações (1 não lida)'))

    expect(screen.getByText('Roadmap')).toBeInTheDocument()
  })

  it('says when there is nothing, instead of showing an empty box', () => {
    shared.props = { notifications: { items: [] } }
    render(<NotificationBell count={0} />)

    fireEvent.click(screen.getByLabelText('Notificações'))

    expect(screen.getByText(/Nada por aqui/)).toBeInTheDocument()
  })

  it('marks everything as read without leaving the page', () => {
    shared.props = { notifications: { items: [notification(1)] } }
    render(<NotificationBell count={1} />)

    fireEvent.click(screen.getByLabelText('Notificações (1 não lida)'))
    fireEvent.click(screen.getByRole('button', { name: 'Marcar todas como lidas' }))

    expect(shared.patch).toHaveBeenCalledWith('/notifications/read', {}, { preserveScroll: true })
  })
})
