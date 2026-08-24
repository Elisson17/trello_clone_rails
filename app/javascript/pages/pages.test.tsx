import { render, screen } from '@testing-library/react'

import SignIn from './Auth/SignIn'

// Mesmo glob do entrypoint: se um módulo de página estourar no eval, o app inteiro
// vira tela branca — este teste é o guarda dessa regressão.
const pages = import.meta.glob<{ default: unknown }>('./**/!(*.test).tsx', { eager: true })

vi.mock('@inertiajs/react', () => ({
  Head: () => null,
  Link: ({ children }: { children: React.ReactNode }) => children,
  usePage: () => ({ props: { auth: { user: null }, flash: { notice: null, alert: null } } }),
  useForm: () => ({
    data: {},
    errors: {},
    processing: false,
    setData: vi.fn(),
    transform: vi.fn(),
    reset: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  }),
}))

vi.mock('@rails/actioncable', () => ({
  createConsumer: () => ({
    subscriptions: { create: () => ({ unsubscribe: vi.fn() }) },
    disconnect: vi.fn(),
  }),
}))

describe('pages bundled by the entrypoint', () => {
  it('never includes a test file', () => {
    expect(Object.keys(pages).some((path) => path.includes('.test.'))).toBe(false)
  })

  it('exports a component as default from every page', () => {
    expect(Object.values(pages).every((page) => typeof page.default === 'function')).toBe(true)
  })

  it('renders the sign in page', () => {
    render(<SignIn />)

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })
})
