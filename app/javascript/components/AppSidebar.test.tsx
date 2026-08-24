import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import { AppSidebar } from './AppSidebar'

const page = vi.hoisted(() => ({ url: '/' }))

vi.mock('@inertiajs/react', () => ({
  usePage: () => ({ props: {}, url: page.url }),
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

const user = { id: 1, name: 'Ana', email: 'ana@example.com', time_zone: 'UTC', avatar_url: null }

const nav = {
  workspaces: [
    { slug: 'produto', name: 'Produto' },
    { slug: 'pessoal', name: 'Pessoal' },
  ],
  recent_boards: [] as { id: number; title: string; workspace_slug: string }[],
}

beforeEach(() => {
  page.url = '/'
})

describe('AppSidebar', () => {
  it('links each workspace to its own page', () => {
    render(<AppSidebar user={user} nav={nav} />)

    expect(screen.getByRole('link', { name: 'Produto' })).toHaveAttribute(
      'href',
      '/workspaces/produto',
    )
  })

  it('marks the workspace of the current url as the current page', () => {
    page.url = '/workspaces/produto'
    render(<AppSidebar user={user} nav={nav} />)

    expect(screen.getByRole('link', { name: 'Produto' })).toHaveAttribute('aria-current', 'page')
  })

  it('leaves the other workspaces unmarked', () => {
    page.url = '/workspaces/produto'
    render(<AppSidebar user={user} nav={nav} />)

    expect(screen.getByRole('link', { name: 'Pessoal' })).not.toHaveAttribute('aria-current')
  })

  it('does not treat every url as the boards home', () => {
    page.url = '/workspaces/produto'
    render(<AppSidebar user={user} nav={nav} />)

    expect(screen.getByRole('link', { name: 'Boards' })).not.toHaveAttribute('aria-current')
  })

  it('hides the recent section while there is nothing to show', () => {
    render(<AppSidebar user={user} nav={nav} />)

    expect(screen.queryByText('Recentes')).not.toBeInTheDocument()
  })

  it('links a recent board once there is one', () => {
    const withRecent = {
      ...nav,
      recent_boards: [{ id: 7, title: 'Roadmap', workspace_slug: 'produto' }],
    }
    render(<AppSidebar user={user} nav={withRecent} />)

    expect(screen.getByRole('link', { name: 'Roadmap' })).toHaveAttribute('href', '/boards/7')
  })

  it('puts the person in the footer', () => {
    render(<AppSidebar user={user} nav={nav} />)

    expect(screen.getByRole('button', { name: /Ana/ })).toBeInTheDocument()
  })
})
