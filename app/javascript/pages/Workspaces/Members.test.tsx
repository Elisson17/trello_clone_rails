import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import WorkspaceMembers from './Members'

// vi.hoisted: o factory do vi.mock sobe para o topo do arquivo e não enxerga const normal.
const router = vi.hoisted(() => ({ patch: vi.fn(), delete: vi.fn() }))

vi.mock('@inertiajs/react', () => ({
  Head: () => null,
  Link: ({ children, ...props }: { children?: ReactNode }) => <a {...props}>{children}</a>,
  router,
  useForm: () => ({
    data: { email_address: '', role: 'member' },
    errors: {},
    processing: false,
    setData: vi.fn(),
    post: vi.fn(),
    reset: vi.fn(),
  }),
}))

const workspace = { id: 1, slug: 'time', name: 'Time', personal: false }
const owner = {
  id: 1,
  role: 'owner' as const,
  is_self: true,
  can_update: false,
  can_destroy: false,
  user: { id: 1, name: 'Demo', email: 'demo@example.com', avatar_url: null },
}
const member = {
  id: 2,
  role: 'member' as const,
  is_self: false,
  can_update: true,
  can_destroy: true,
  user: { id: 2, name: 'Ana', email: 'ana@example.com', avatar_url: null },
}

function renderPage(overrides: Partial<Parameters<typeof WorkspaceMembers>[0]> = {}) {
  return render(
    <WorkspaceMembers
      workspace={workspace}
      members={[owner, member]}
      invitations={[]}
      roles={['owner', 'admin', 'member']}
      can={{ manage_members: true }}
      {...overrides}
    />,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('Workspaces/Members', () => {
  it('lists every member', () => {
    renderPage()

    expect(screen.getByText('ana@example.com')).toBeInTheDocument()
    expect(screen.getByText(/\(você\)/)).toBeInTheDocument()
  })

  it('shows the invite form only to who can manage members', () => {
    const { unmount } = renderPage()
    expect(screen.getByLabelText(/convidar por e-mail/i)).toBeInTheDocument()
    unmount()

    renderPage({ can: { manage_members: false } })
    expect(screen.queryByLabelText(/convidar por e-mail/i)).not.toBeInTheDocument()
  })

  it('only removes a member after the confirmation is accepted', async () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Remover Ana' }))
    expect(await screen.findByText('Remover Ana?')).toBeInTheDocument()
    expect(router.delete).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Remover' }))

    expect(router.delete).toHaveBeenCalledWith('/workspaces/time/memberships/2')
  })

  it('renders a role select only where the policy allows it', () => {
    renderPage()

    // Só a Ana é editável; o owner cai no badge de leitura.
    expect(screen.getByLabelText('Papel de Ana')).toBeInTheDocument()
    expect(screen.queryByLabelText('Papel de Demo')).not.toBeInTheDocument()
  })

  it('sends the new role on change', () => {
    renderPage()

    fireEvent.change(screen.getByLabelText('Papel de Ana'), { target: { value: 'admin' } })

    expect(router.patch).toHaveBeenCalledWith(
      '/workspaces/time/memberships/2',
      { role: 'admin' },
      { preserveScroll: true },
    )
  })

  it('lists pending invitations', () => {
    renderPage({
      invitations: [
        {
          id: 9,
          email_address: 'convidada@example.com',
          role: 'member',
          expires_at: '2026-09-01T00:00:00Z',
          expired: false,
        },
      ],
    })

    expect(screen.getByText('convidada@example.com')).toBeInTheDocument()
  })
})
