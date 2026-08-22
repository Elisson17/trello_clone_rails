import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import Home from './Home'

const auth = {
  user: { id: 1, name: 'Elisson', email: 'e@example.com', time_zone: 'UTC', avatar_url: null },
}

vi.mock('@inertiajs/react', () => ({
  Head: () => null,
  Link: ({ children, ...props }: { children?: ReactNode }) => <a {...props}>{children}</a>,
  usePage: () => ({ props: { auth } }),
}))

describe('Home', () => {
  it('greets the current user', () => {
    render(<Home />)

    expect(screen.getByText('Olá, Elisson 👋')).toBeInTheDocument()
  })
})
