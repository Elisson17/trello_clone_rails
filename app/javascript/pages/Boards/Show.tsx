import { Head, Link, router } from '@inertiajs/react'
import { ArchiveIcon, ArrowLeftIcon, CheckIcon, ClockIcon, EllipsisIcon } from 'lucide-react'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EditableTitle } from '@/components/EditableTitle'
import { InlineAdd } from '@/components/InlineAdd'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BOARD_THEME } from '@/lib/board-theme'
import { cn } from '@/lib/utils'
import type { BoardPayload, CardPayload, ListPayload } from '@/types/inertia'

type Can = { update: boolean; destroy: boolean; archive: boolean }

export default function BoardShow({ board, can }: { board: BoardPayload; can: Can }) {
  const theme = BOARD_THEME[board.background]

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <Head title={board.title} />

      <header className="border-b px-4 py-4">
        <div className="mx-auto flex max-w-full flex-wrap items-center gap-3">
          <Link
            href={`/workspaces/${board.workspace.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            {board.workspace.name}
          </Link>

          <span aria-hidden className={cn('h-5 w-1 rounded-full', theme.rail)} />

          <EditableTitle
            as="h1"
            value={board.title}
            url={`/boards/${board.id}`}
            readOnly={!can.update}
            className="text-lg font-semibold tracking-tight"
          />

          <span className="text-xs text-muted-foreground">
            {board.cards_count === 1 ? '1 card' : `${board.cards_count} cards`}
          </span>

          <div className="ml-auto">{can.archive && <BoardMenu board={board} can={can} />}</div>
        </div>
      </header>

      {/* Rolagem horizontal fica só nas colunas — a página em si nunca rola de lado. */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex h-full items-start gap-3">
          {board.lists.map((list) => (
            <ListColumn key={list.id} board={board} list={list} canWrite={can.update} />
          ))}

          {can.update && (
            <InlineAdd
              label="Adicionar lista"
              placeholder="Nome da lista"
              url={`/boards/${board.id}/lists`}
              className="w-72 shrink-0 rounded-xl border border-dashed p-2"
            />
          )}

          {board.lists.length === 0 && !can.update && (
            <p className="text-sm text-muted-foreground">Este board ainda não tem listas.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function BoardMenu({ board, can }: { board: BoardPayload; can: Can }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Ações do board">
          <EllipsisIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => router.post(`/boards/${board.id}/archive`)}>
          <ArchiveIcon />
          Arquivar board
        </DropdownMenuItem>

        {can.destroy && (
          <ConfirmDialog
            title={`Excluir ${board.title}?`}
            description="As listas e os cards deste board são apagados. Não dá para desfazer — arquivar guarda tudo."
            confirmLabel="Excluir board"
            destructive
            onConfirm={() => router.delete(`/boards/${board.id}`)}
          >
            <DropdownMenuItem variant="destructive" onSelect={(event) => event.preventDefault()}>
              Excluir board
            </DropdownMenuItem>
          </ConfirmDialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ListColumn({
  board,
  list,
  canWrite,
}: {
  board: BoardPayload
  list: ListPayload
  canWrite: boolean
}) {
  return (
    <section className="flex max-h-full w-72 shrink-0 flex-col rounded-xl border bg-card">
      <header className="flex items-center gap-1 border-b px-2 py-2">
        <EditableTitle
          value={list.title}
          url={`/boards/${board.id}/lists/${list.id}`}
          readOnly={!canWrite}
          className="flex-1 text-sm font-semibold"
        />
        <span className="px-1 text-xs tabular-nums text-muted-foreground">{list.cards.length}</span>

        {canWrite && (
          <ConfirmDialog
            title={`Arquivar ${list.title}?`}
            description="A lista e os cards dela sumem do board, mas continuam guardados."
            confirmLabel="Arquivar"
            onConfirm={() => router.delete(`/boards/${board.id}/lists/${list.id}`)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              aria-label={`Arquivar ${list.title}`}
            >
              <ArchiveIcon className="size-3.5" />
            </Button>
          </ConfirmDialog>
        )}
      </header>

      <ul className="flex flex-col gap-2 overflow-y-auto p-2">
        {list.cards.map((card) => (
          <li key={card.id}>
            <CardTile card={card} canWrite={canWrite} />
          </li>
        ))}
      </ul>

      {canWrite && (
        <InlineAdd
          label="Adicionar card"
          placeholder="Título do card"
          url="/cards"
          payload={{ list_id: list.id }}
          className="p-2 pt-0"
        />
      )}
    </section>
  )
}

function CardTile({ card, canWrite }: { card: CardPayload; canWrite: boolean }) {
  const completionUrl = `/cards/${card.id}/completion`

  return (
    <article
      className={cn(
        'group rounded-lg border bg-background p-2.5 transition-colors hover:border-foreground/20',
        card.completed && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-2">
        {canWrite && (
          <button
            type="button"
            aria-label={card.completed ? `Reabrir ${card.title}` : `Concluir ${card.title}`}
            aria-pressed={card.completed}
            className={cn(
              'mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border transition-colors',
              card.completed
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'border-input hover:border-foreground',
            )}
            onClick={() =>
              card.completed
                ? router.delete(completionUrl, { preserveScroll: true })
                : router.post(completionUrl, {}, { preserveScroll: true })
            }
          >
            {card.completed && <CheckIcon className="size-2.5" />}
          </button>
        )}

        <span className={cn('flex-1 text-sm', card.completed && 'line-through')}>{card.title}</span>

        {canWrite && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Arquivar ${card.title}`}
            className="size-6 shrink-0 text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
            onClick={() => router.post(`/cards/${card.id}/archive`, {}, { preserveScroll: true })}
          >
            <ArchiveIcon className="size-3" />
          </Button>
        )}
      </div>

      {card.due_at && (
        <span
          className={cn(
            'mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
            card.overdue ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground',
          )}
        >
          <ClockIcon className="size-3" />
          {new Date(card.due_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
      )}
    </article>
  )
}
