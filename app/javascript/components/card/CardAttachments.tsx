import { router } from '@inertiajs/react'
import { PaperclipIcon, Trash2Icon } from 'lucide-react'
import { useRef } from 'react'

import { Button } from '@/components/ui/button'
import { humanSize } from '@/lib/card-format'
import type { AttachmentPayload } from '@/types/inertia'

export function CardAttachments({
  cardId,
  attachments,
  canWrite,
}: {
  cardId: number
  attachments: AttachmentPayload[]
  canWrite: boolean
}) {
  const picker = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1">
        {attachments.map((attachment) => (
          <li key={attachment.id} className="group/file flex items-center gap-2 text-sm">
            <PaperclipIcon className="size-3.5 shrink-0 text-muted-foreground" />

            <a
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 flex-1 truncate underline-offset-2 hover:underline"
            >
              {attachment.filename}
            </a>

            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {humanSize(attachment.byte_size)}
            </span>

            {canWrite && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover/file:opacity-100"
                aria-label={`Excluir ${attachment.filename}`}
                onClick={() =>
                  router.delete(`/cards/${cardId}/attachments/${attachment.id}`, {
                    preserveScroll: true,
                  })
                }
              >
                <Trash2Icon className="size-3" />
              </Button>
            )}
          </li>
        ))}
      </ul>

      {canWrite && (
        <>
          {/* O input de arquivo fica escondido porque o estilo dele não é controlável;
              o botão é o alvo de verdade, e o `aria-label` mantém o campo anunciável. */}
          <input
            ref={picker}
            type="file"
            className="sr-only"
            aria-label="Anexar arquivo"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return

              router.post(
                `/cards/${cardId}/attachments`,
                { file },
                { preserveScroll: true, forceFormData: true },
              )
              event.target.value = ''
            }}
          />

          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => picker.current?.click()}
          >
            <PaperclipIcon />
            Anexar arquivo
          </Button>
        </>
      )}
    </div>
  )
}
