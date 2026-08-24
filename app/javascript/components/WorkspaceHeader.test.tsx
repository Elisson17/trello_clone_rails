import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { WorkspaceSummary } from '@/types/inertia'
import { WorkspaceHeader } from './WorkspaceHeader'

vi.mock('@inertiajs/react', () => ({
  Link: ({ children, ...props }: { children?: ReactNode }) => <a {...props}>{children}</a>,
  router: { delete: vi.fn(), patch: vi.fn() },
  useForm: () => ({
    data: { name: 'Produto' },
    errors: {},
    processing: false,
    setData: vi.fn(),
    patch: vi.fn(),
    reset: vi.fn(),
  }),
}))

const workspace: WorkspaceSummary = {
  id: 1,
  slug: 'produto',
  name: 'Produto',
  personal: false,
  members_count: 4,
  role: 'owner',
  membership_id: 9,
  members_preview: [{ id: 7, name: 'Ana', avatar_url: null }],
}

const can = {
  update: true,
  destroy: true,
  manage_members: true,
  leave: true,
  create_board: true,
}

describe('WorkspaceHeader', () => {
  it('names the workspace', () => {
    render(<WorkspaceHeader workspace={workspace} can={can} archivedCount={0} />)

    expect(screen.getByRole('heading', { name: 'Produto' })).toBeInTheDocument()
  })

  it('links to the members screen, which is a screen and not a menu item', () => {
    render(<WorkspaceHeader workspace={workspace} can={can} archivedCount={0} />)

    expect(screen.getByRole('link', { name: /Membros/ })).toHaveAttribute(
      'href',
      '/workspaces/produto/memberships',
    )
  })

  it('offers the archived boards only when there are any', () => {
    const { rerender } = render(
      <WorkspaceHeader workspace={workspace} can={can} archivedCount={0} />,
    )
    expect(screen.queryByRole('link', { name: /Arquivados/ })).not.toBeInTheDocument()

    rerender(<WorkspaceHeader workspace={workspace} can={can} archivedCount={2} />)
    expect(screen.getByRole('link', { name: /Arquivados/ })).toHaveAttribute(
      'href',
      '/workspaces/produto/boards',
    )
  })

  it('hides the management menu from someone who can do none of it', () => {
    render(
      <WorkspaceHeader
        workspace={workspace}
        can={{ ...can, update: false, destroy: false, leave: false }}
        archivedCount={0}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Gerenciar workspace' })).not.toBeInTheDocument()
  })
})
