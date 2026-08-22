import { render, screen } from '@testing-library/react'
import Home from './Home'

// <Head> precisa do contexto do createInertiaApp; fora dele basta neutralizar.
vi.mock('@inertiajs/react', async (original) => ({
  ...(await original<typeof import('@inertiajs/react')>()),
  Head: () => null,
}))

test('renderiza nome e boards', () => {
  render(<Home name="Elisson" boards={[{ id: 1, title: 'Backlog' }]} />)
  expect(screen.getByText('Olá, Elisson 👋')).toBeInTheDocument()
  expect(screen.getByText('Backlog')).toBeInTheDocument()
})
