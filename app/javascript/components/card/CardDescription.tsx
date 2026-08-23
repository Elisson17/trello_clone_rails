import { router } from '@inertiajs/react'
import { useState } from 'react'

import { Markdown } from '@/components/Markdown'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function CardDescription({
  cardId,
  description,
  canWrite,
}: {
  cardId: number
  description: string | null
  canWrite: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(description ?? '')

  function save() {
    router.patch(
      `/cards/${cardId}`,
      { description: draft },
      { preserveScroll: true, onSuccess: () => setEditing(false) },
    )
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2">
        <Textarea
          autoFocus
          aria-label="Descrição do card"
          placeholder="Markdown é bem-vindo: **negrito**, listas, `código`."
          className="min-h-32"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />

        <div className="flex gap-2">
          <Button size="sm" onClick={save}>
            Salvar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDraft(description ?? '')
              setEditing(false)
            }}
          >
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  if (!description) {
    return canWrite ? (
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start text-muted-foreground"
        onClick={() => setEditing(true)}
      >
        Adicionar uma descrição
      </Button>
    ) : (
      <p className="text-sm text-muted-foreground">Sem descrição.</p>
    )
  }

  return (
    <div className="group/description flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <Markdown>{description}</Markdown>
      </div>

      {canWrite && (
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover/description:opacity-100"
          onClick={() => {
            setDraft(description)
            setEditing(true)
          }}
        >
          Editar
        </Button>
      )}
    </div>
  )
}
