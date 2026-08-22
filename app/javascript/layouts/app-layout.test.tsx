import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

import AppLayout from './app-layout'

const flash = { notice: null as string | null, alert: null as string | null }
const auth = { user: null }

vi.mock('@inertiajs/react', () => ({
  usePage: () => ({ props: { auth, flash } }),
  Link: ({ children, ...props }: { children?: ReactNode }) => <a {...props}>{children}</a>,
}))
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}))

beforeEach(() => {
  flash.notice = null
  flash.alert = null
  vi.clearAllMocks()
})

describe('AppLayout', () => {
  it('renders the page content', () => {
    render(
      <AppLayout>
        <p>content</p>
      </AppLayout>,
    )

    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('renders the theme toggle', () => {
    render(<AppLayout>{null}</AppLayout>)

    expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument()
  })

  it('turns flash.notice into a success toast', () => {
    flash.notice = 'Card created.'
    render(<AppLayout>{null}</AppLayout>)

    expect(toast.success).toHaveBeenCalledWith('Card created.')
  })

  it('turns flash.alert into an error toast', () => {
    flash.alert = 'Something went wrong.'
    render(<AppLayout>{null}</AppLayout>)

    expect(toast.error).toHaveBeenCalledWith('Something went wrong.')
  })

  it('does not toast when there is no flash', () => {
    render(<AppLayout>{null}</AppLayout>)

    expect(toast.success).not.toHaveBeenCalled()
  })
})
