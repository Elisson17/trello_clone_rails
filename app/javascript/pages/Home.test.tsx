import { render, screen } from '@testing-library/react'

import Home from './Home'

// <Head> needs the createInertiaApp context; outside of it we just neutralize it.
vi.mock('@inertiajs/react', async (original) => ({
  ...(await original<typeof import('@inertiajs/react')>()),
  Head: () => null,
}))

const boards = [{ id: 1, title: 'Backlog' }]

describe('Home', () => {
  it('greets the current user', () => {
    render(<Home name="Elisson" boards={boards} />)

    expect(screen.getByText('Olá, Elisson 👋')).toBeInTheDocument()
  })

  it('lists the boards', () => {
    render(<Home name="Elisson" boards={boards} />)

    expect(screen.getByText('Backlog')).toBeInTheDocument()
  })
})
