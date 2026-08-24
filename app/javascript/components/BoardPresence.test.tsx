import { render, screen } from '@testing-library/react'

import { BoardPresence } from './BoardPresence'

const ana = { id: 2, name: 'Ana Souza', avatar_url: null }
const bia = { id: 3, name: 'Bia Lima', avatar_url: null }

describe('BoardPresence', () => {
  it('renders nothing when nobody else is here', () => {
    const { container } = render(<BoardPresence people={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  // Opacidade não é informação para leitor de tela.
  it('says out loud who is watching and who is on another tab', () => {
    render(
      <BoardPresence
        people={[
          { user: ana, active: true },
          { user: bia, active: false },
        ]}
      />,
    )

    expect(screen.getByLabelText('Ana Souza, vendo agora')).toBeInTheDocument()
    expect(screen.getByLabelText('Bia Lima, em outra aba')).toBeInTheDocument()
  })

  it('stops at five, because the sixth avatar says nothing', () => {
    const many = [1, 2, 3, 4, 5, 6].map((id) => ({
      user: { id, name: `Pessoa ${id}`, avatar_url: null },
      active: true,
    }))

    render(<BoardPresence people={many} />)

    expect(screen.getAllByRole('img')).toHaveLength(5)
    expect(screen.getByText('+1')).toBeInTheDocument()
  })
})
