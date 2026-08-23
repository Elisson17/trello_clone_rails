import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import { NotificationBell } from './NotificationBell'

vi.mock('@inertiajs/react', () => ({
  Link: ({ children, ...props }: { children?: ReactNode }) => <a {...props}>{children}</a>,
}))

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
})
