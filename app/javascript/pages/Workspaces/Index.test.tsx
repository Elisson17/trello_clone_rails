import { fireEvent, render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'

import WorkspacesIndex from './Index'

const form = vi.hoisted(() => ({
  data: { name: '' },
  errors: {} as Record<string, string>,
  processing: false,
  setData: vi.fn(),
  post: vi.fn(),
  reset: vi.fn(),
}))

vi.mock('@inertiajs/react', () => ({
  Head: () => null,
  Link: ({ children, ...props }: { children?: ReactNode }) => <a {...props}>{children}</a>,
  useForm: () => form,
}))

const workspace = {
  id: 1,
  slug: 'time-de-produto',
  name: 'Time de Produto',
  personal: false,
  members_count: 3,
  role: 'owner' as const,
  membership_id: 1,
  members_preview: [{ id: 1, name: 'Demo', avatar_url: null }],
}

beforeEach(() => vi.clearAllMocks())

describe('Workspaces/Index', () => {
  it('shows recent boards across workspaces', () => {
    render(
      <WorkspacesIndex
        workspaces={[workspace]}
        recent_boards={[
          {
            id: 7,
            title: 'Roadmap',
            background: 'sky',
            workspace: { slug: 'time-de-produto', name: 'Time de Produto' },
          },
        ]}
      />,
    )

    expect(screen.getByRole('link', { name: /Roadmap/ })).toHaveAttribute('href', '/boards/7')
  })

  it('links each workspace to its page', () => {
    render(<WorkspacesIndex workspaces={[workspace]} recent_boards={[]} />)

    expect(screen.getByRole('link', { name: /Time de Produto/ })).toHaveAttribute(
      'href',
      '/workspaces/time-de-produto',
    )
  })

  it('sums the members not shown in the avatar stack', () => {
    render(<WorkspacesIndex workspaces={[workspace]} recent_boards={[]} />)

    expect(screen.getByText('+2')).toBeInTheDocument()
    expect(screen.getByText('3 membros')).toBeInTheDocument()
  })

  it('invites the first workspace when the list is empty', () => {
    render(<WorkspacesIndex workspaces={[]} recent_boards={[]} />)

    expect(screen.getByText('Nenhum workspace ainda')).toBeInTheDocument()
  })

  it('creates a workspace from the dialog', async () => {
    render(<WorkspacesIndex workspaces={[workspace]} recent_boards={[]} />)

    fireEvent.click(screen.getByRole('button', { name: /novo workspace/i }))

    const dialog = await screen.findByRole('dialog')
    // jsdom não faz submit implícito no clique do botão; disparamos no <form>.
    const submit = within(dialog).getByRole('button', { name: 'Criar workspace' })
    fireEvent.submit(submit.closest('form') as HTMLFormElement)

    expect(form.post).toHaveBeenCalledWith('/workspaces', expect.anything())
  })
})
