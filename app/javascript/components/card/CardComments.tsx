import { router, useForm } from '@inertiajs/react'
import { useState } from 'react'

import { Markdown } from '@/components/Markdown'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { relativeTime } from '@/lib/card-format'
import type { CommentPayload } from '@/types/inertia'

export function CardComments({
  cardId,
  comments,
  canWrite,
  footer,
}: {
  cardId: number
  comments: CommentPayload[]
  canWrite: boolean
  /** Ação que fica ao lado de "Comentar", como o "Close issue" do GitHub. */
  footer?: React.ReactNode
}) {
  const form = useForm<{ body: string }>({ body: '' })

  return (
    <div className="flex flex-col gap-3">
      {comments.length === 0 && (
        <p className="text-xs text-muted-foreground">Nenhum comentário ainda.</p>
      )}

      <ul className="flex flex-col gap-3">
        {comments.map((comment) => (
          <Comment key={comment.id} cardId={cardId} comment={comment} />
        ))}
      </ul>

      {canWrite && (
        <form
          className="flex flex-col gap-2 rounded-md border"
          onSubmit={(event) => {
            event.preventDefault()
            if (!form.data.body.trim()) return

            form.post(`/cards/${cardId}/comments`, {
              preserveScroll: true,
              onSuccess: () => form.reset(),
            })
          }}
        >
          <Textarea
            aria-label="Novo comentário"
            placeholder="Use Markdown para formatar o comentário…"
            className="min-h-20 rounded-b-none border-0 border-b shadow-none focus-visible:ring-0"
            value={form.data.body}
            aria-invalid={!!form.errors.body || undefined}
            onChange={(event) => form.setData('body', event.target.value)}
          />

          <div className="flex flex-wrap items-center justify-end gap-2 px-3 pb-3">
            {form.errors.body && (
              <span className="mr-auto text-xs font-medium text-destructive">
                {form.errors.body}
              </span>
            )}

            {footer}

            <Button type="submit" size="sm" disabled={form.processing}>
              Comentar
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

// Caixa com cabeçalho, como o comentário de uma issue: quem falou e quando ficam numa
// faixa própria, separada do corpo.
function Comment({ cardId, comment }: { cardId: number; comment: CommentPayload }) {
  const [draft, setDraft] = useState<string | null>(null)
  const url = `/cards/${cardId}/comments/${comment.id}`

  return (
    <li className="overflow-hidden rounded-md border">
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/60 px-3 py-2">
        <Avatar size="sm" className="size-5">
          <AvatarImage src={comment.author.avatar_url ?? undefined} alt="" />
          <AvatarFallback className="text-[10px]">
            {comment.author.name[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <span className="text-xs font-semibold">{comment.author.name}</span>
        <span className="text-xs text-muted-foreground">
          comentou {relativeTime(comment.created_at)}
          {comment.edited && ' · editado'}
        </span>

        {draft === null && (comment.can_edit || comment.can_destroy) && (
          <div className="ml-auto flex gap-3">
            {/* A janela de 15 min é decidida no servidor: `can_edit` já vem apagado. */}
            {comment.can_edit && (
              <button
                type="button"
                className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                onClick={() => setDraft(comment.body)}
              >
                Editar
              </button>
            )}

            {comment.can_destroy && (
              <button
                type="button"
                className="text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
                onClick={() => router.delete(url, { preserveScroll: true })}
              >
                Excluir
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-3 py-2.5">
        {draft === null ? (
          <Markdown>{comment.body}</Markdown>
        ) : (
          <div className="flex flex-col gap-2">
            <Textarea
              autoFocus
              aria-label="Editar comentário"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() =>
                  router.patch(
                    url,
                    { body: draft },
                    { preserveScroll: true, onSuccess: () => setDraft(null) },
                  )
                }
              >
                Salvar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}
