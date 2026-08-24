import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

import AppLayout from './app-layout'

const flash = { notice: null as string | null, alert: null as string | null }
const auth = { user: null as null | Record<string, unknown> }
const nav = {
  current: null as null | { workspaces: { slug: string; name: string }[]; recent_boards: [] },
}

vi.mock('@inertiajs/react', () => ({
  usePage: () => ({
    url: '/',
    props: { auth, flash, unread_notifications_count: 0, nav: nav.current },
  }),
  useForm: () => ({
    data: { name: '' },
    errors: {},
    processing: false,
    post: vi.fn(),
    reset: vi.fn(),
    setData: vi.fn(),
  }),
  router: { get: vi.fn() },
  Link: ({ children, ...props }: { children?: ReactNode }) => <a {...props}>{children}</a>,
}))
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}))

function signIn() {
  auth.user = { id: 1, name: 'Ana', email: 'ana@example.com', time_zone: 'UTC', avatar_url: null }
  nav.current = { workspaces: [{ slug: 'produto', name: 'Produto' }], recent_boards: [] }
}

beforeEach(() => {
  flash.notice = null
  flash.alert = null
  auth.user = null
  nav.current = null
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

  it('renders no navigation for a signed out visitor', () => {
    render(<AppLayout>{null}</AppLayout>)

    expect(screen.queryByRole('navigation', { name: 'Principal' })).not.toBeInTheDocument()
  })

  it('renders the navigation for a signed in user', () => {
    signIn()
    render(<AppLayout>{null}</AppLayout>)

    expect(screen.getAllByRole('navigation', { name: 'Principal' }).length).toBeGreaterThan(0)
  })

  it('keeps the notification bell in the header', () => {
    signIn()
    render(<AppLayout>{null}</AppLayout>)

    // A sidebar também leva a /notifications: aqui o alvo é o sino, e ele mora no header.
    const header = within(screen.getByRole('banner'))

    expect(header.getByRole('button', { name: /Notificações/ })).toBeInTheDocument()
  })

  it('offers a way to open the navigation on a narrow screen', () => {
    signIn()
    render(<AppLayout>{null}</AppLayout>)

    expect(screen.getByRole('button', { name: 'Abrir navegação' })).toBeInTheDocument()
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
