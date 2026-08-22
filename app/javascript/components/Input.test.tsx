import { render, screen } from '@testing-library/react'

import { Input } from './Input'

describe('Input', () => {
  it('renders the label tied to the field', () => {
    render(<Input label="E-mail" />)

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
  })

  it('joins multiple error messages', () => {
    render(<Input label="Senha" error={['é muito curta', 'não é igual']} />)

    expect(screen.getByText('é muito curta, não é igual')).toBeInTheDocument()
  })

  it('marks the field invalid when there is an error', () => {
    // Com erro, o texto do <label> passa a incluir a mensagem — daí o regex.
    render(<Input label="Senha" error="é muito curta" />)

    expect(screen.getByLabelText(/Senha/)).toHaveAttribute('aria-invalid', 'true')
  })

  it('hides the hint while an error is showing', () => {
    render(<Input label="Senha" hint="Mínimo de 8 caracteres." error="é muito curta" />)

    expect(screen.queryByText('Mínimo de 8 caracteres.')).not.toBeInTheDocument()
  })
})
