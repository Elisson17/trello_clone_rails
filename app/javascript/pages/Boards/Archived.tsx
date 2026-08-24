import { Head, Link, router } from '@inertiajs/react'
import { ArchiveIcon, ArrowLeftIcon, RotateCcwIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

type ArchivedList = { id: number; title: string; archived_at: string; cards_count: number }
type ArchivedCard = {
  id: number
  title: string
  archived_at: string
  list: { id: number; title: string; archived: boolean }
}

const since = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

export default function BoardArchived({
  board,
  can,
  lists,
  cards,
}: {
  board: { id: number; title: string }
  can: { restore: boolean }
  lists: ArchivedList[]
  cards: ArchivedCard[]
}) {
  const empty = lists.length === 0 && cards.length === 0

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Head title={`Arquivados · ${board.title}`} />

      <Link
        href={`/boards/${board.id}`}
        className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <ArrowLeftIcon className="size-3.5" />
        {board.title}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Arquivados</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Nada aqui foi apagado. Restaurar devolve o item ao board, no fim da coluna.
      </p>

      {empty && (
        <p className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          <ArchiveIcon aria-hidden className="size-5" />
          Nenhuma lista e nenhum card arquivado neste board.
        </p>
      )}

      {lists.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-muted-foreground">Listas</h2>
          <ul className="mt-2 divide-y rounded-xl border bg-card">
            {lists.map((list) => (
              <li key={list.id} className="flex items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{list.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {list.cards_count} {list.cards_count === 1 ? 'card' : 'cards'} · arquivada em{' '}
                    {since(list.archived_at)}
                  </span>
                </span>

                {can.restore && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.delete(`/boards/${board.id}/lists/${list.id}/archive`, {
                        preserveScroll: true,
                      })
                    }
                  >
                    <RotateCcwIcon />
                    Restaurar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {cards.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-muted-foreground">Cards</h2>
          <ul className="mt-2 divide-y rounded-xl border bg-card">
            {cards.map((card) => (
              <li key={card.id} className="flex items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{card.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {card.list.title} · arquivado em {since(card.archived_at)}
                    {card.list.archived && ' · a lista também está arquivada'}
                  </span>
                </span>

                {can.restore && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.delete(`/cards/${card.id}/archive`, { preserveScroll: true })
                    }
                  >
                    <RotateCcwIcon />
                    Restaurar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
