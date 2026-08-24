import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import { UserMenu } from './UserMenu'

vi.mock('@inertiajs/react', () => ({
  Link: ({ children, ...props }: { children?: ReactNode }) => <a {...props}>{children}</a>,
}))

const user = {
  id: 1,
  name: 'Ana Souza',
  email: 'ana@example.com',
  time_zone: 'UTC',
  avatar_url: null,
}

// O conteúdo do menu não é testado aqui: abrir menu do Radix em jsdom depende de eventos
// de ponteiro que o ambiente não emite, e nenhum outro teste do projeto faz isso.
describe('UserMenu', () => {
  it('names the person on the trigger', () => {
    render(<UserMenu user={user} />)

    expect(screen.getByRole('button', { name: /Ana Souza/ })).toBeInTheDocument()
  })

  it('fills the width of the sidebar footer', () => {
    render(<UserMenu user={user} />)

    expect(screen.getByRole('button', { name: /Ana Souza/ })).toHaveClass('w-full')
  })
})
