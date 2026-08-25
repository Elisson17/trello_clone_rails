import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'

import { AvatarPicker } from './AvatarPicker'

const presets = [
  { key: 'vermelho', url: '/assets/avatars/vermelho-abc.svg' },
  { key: 'violeta', url: '/assets/avatars/violeta-def.svg' },
]

// O componente é controlado; sem um dono do estado nenhuma escolha gruda.
function Harness({ savedUploadUrl = null }: { savedUploadUrl?: string | null }) {
  const [preset, setPreset] = useState('')
  const [file, setFile] = useState<File | null>(null)

  return (
    <AvatarPicker
      presets={presets}
      preset={preset}
      file={file}
      name="Ana"
      savedUploadUrl={savedUploadUrl}
      onPick={setPreset}
      onUpload={setFile}
    />
  )
}

const photo = () => new File(['x'], 'eu.png', { type: 'image/png' })
const uploadTile = () => screen.getByLabelText('Enviar uma foto') as HTMLInputElement
const sources = (root: HTMLElement) =>
  [...root.querySelectorAll('img')].map((img) => img.getAttribute('src'))

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:preview')
  URL.revokeObjectURL = vi.fn()
})

describe('AvatarPicker', () => {
  it('starts on "no avatar", showing the initial of the name', () => {
    render(<Harness />)

    expect(screen.getByLabelText(/Sem avatar/)).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText(/Sem avatar/)).toHaveTextContent('A')
  })

  it('marks the disc that was picked', () => {
    render(<Harness />)
    fireEvent.click(screen.getByLabelText('Avatar violeta'))

    expect(screen.getByLabelText('Avatar violeta')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText(/Sem avatar/)).toHaveAttribute('aria-pressed', 'false')
  })

  // O ponto do pedido: a imagem aparece na hora, sem ida ao servidor.
  it('renders the photo the moment it is chosen', () => {
    const { container } = render(<Harness />)
    fireEvent.change(uploadTile(), { target: { files: [photo()] } })

    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(sources(container)).toContain('blob:preview')
    expect(screen.getByText('eu.png')).toBeTruthy()
  })

  it('drops the disc when a photo arrives', () => {
    render(<Harness />)
    fireEvent.click(screen.getByLabelText('Avatar violeta'))
    fireEvent.change(uploadTile(), { target: { files: [photo()] } })

    expect(screen.getByLabelText('Avatar violeta')).toHaveAttribute('aria-pressed', 'false')
  })

  it('drops the photo when a disc is picked', () => {
    render(<Harness />)
    fireEvent.change(uploadTile(), { target: { files: [photo()] } })
    fireEvent.click(screen.getByLabelText('Avatar vermelho'))

    expect(screen.queryByText('eu.png')).toBeNull()
  })

  // Sem isto "sem avatar" continuaria exibindo a foto que já estava salva.
  it('stops showing the saved photo once something else is picked', () => {
    const { container } = render(<Harness savedUploadUrl="/rails/blob/1" />)

    expect(sources(container)).toContain('/rails/blob/1')

    fireEvent.click(screen.getByLabelText(/Sem avatar/))

    expect(sources(container)).not.toContain('/rails/blob/1')
  })
})
