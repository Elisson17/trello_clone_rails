import { PlusIcon } from 'lucide-react'
import { useEffect, useId, useState } from 'react'

import type { FieldError } from '@/components/Field'
import { cn } from '@/lib/utils'

export type AvatarPreset = { key: string; url: string }

const TILE =
  'relative size-11 rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring'

// O anel de escolhido fica fora do disco para não comer pixel da arte, e o `ring-offset`
// separa os dois com a cor do cartão em vez de um vão transparente.
const CHOSEN = 'ring-2 ring-primary ring-offset-2 ring-offset-card'

export function AvatarPicker({
  presets,
  preset,
  file,
  name,
  savedUploadUrl,
  error,
  onPick,
  onUpload,
}: {
  presets: AvatarPreset[]
  preset: string
  file: File | null
  name: string
  /** Avatar já salvo, só quando é foto: o disco pronto já se identifica por `preset`. */
  savedUploadUrl: string | null
  error?: FieldError
  onPick: (key: string) => void
  onUpload: (file: File | null) => void
}) {
  const inputId = useId()
  const [preview, setPreview] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  // A foto aparece no instante da escolha, sem passar pelo servidor. O `revoke` é o que
  // impede o blob de vazar a cada troca de arquivo.
  useEffect(() => {
    if (!file) return setPreview(null)

    const url = URL.createObjectURL(file)
    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  // Enquanto ninguém mexeu, o que vale é o que está salvo. Depois do primeiro clique, só
  // vale a escolha desta sessão — senão "sem avatar" continuaria mostrando a foto antiga.
  const photo = preview ?? (touched ? null : savedUploadUrl)
  const none = !preset && !photo
  const initial = name.trim()[0]?.toUpperCase() ?? '?'

  const pick = (key: string) => {
    setTouched(true)
    onPick(key)
    onUpload(null)
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-[13px] font-semibold text-foreground">Avatar</legend>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={none}
          aria-label="Sem avatar, mostrar a inicial do nome"
          onClick={() => pick('')}
          className={cn(
            TILE,
            'grid place-items-center bg-muted text-sm font-medium text-muted-foreground',
            none && CHOSEN,
          )}
        >
          {initial}
        </button>

        {presets.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={preset === item.key}
            aria-label={`Avatar ${item.key}`}
            onClick={() => pick(item.key)}
            className={cn(TILE, preset === item.key && CHOSEN)}
          >
            <img src={item.url} alt="" className="size-full rounded-full" />
          </button>
        ))}

        {/* O label é o alvo de clique do input escondido: fechando a fileira, o disco com o
            `+` lê como "mais um avatar" — que por acaso é o seu. */}
        <label
          htmlFor={inputId}
          className={cn(
            TILE,
            'grid cursor-pointer place-items-center overflow-hidden text-muted-foreground transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring',
            photo ? CHOSEN : 'border border-dashed hover:border-primary hover:text-primary',
          )}
        >
          {photo ? (
            <img src={photo} alt="" className="size-full object-cover" />
          ) : (
            <PlusIcon className="size-4" aria-hidden />
          )}

          <input
            id={inputId}
            type="file"
            className="sr-only"
            accept="image/png,image/jpeg,image/webp"
            // Zerar antes de abrir: sem isto, reescolher o mesmo arquivo não dispara `change`.
            onClick={(event) => {
              event.currentTarget.value = ''
            }}
            onChange={(event) => {
              const picked = event.target.files?.[0] ?? null
              setTouched(true)
              if (picked) onPick('')
              onUpload(picked)
            }}
          />
          <span className="sr-only">Enviar uma foto</span>
        </label>
      </div>

      {error ? (
        <p className="text-[12.5px] font-medium text-destructive">
          {Array.isArray(error) ? error.join(', ') : error}
        </p>
      ) : (
        <p className="text-[12.5px] text-muted-foreground">
          {file
            ? file.name
            : 'Escolha um disco pronto, ou envie uma foto PNG, JPEG ou WebP até 2 MB.'}
        </p>
      )}
    </fieldset>
  )
}
