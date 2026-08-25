import { Head, Link, router } from '@inertiajs/react'
import { ArchiveIcon, RotateCcwIcon } from 'lucide-react'

import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'

type ArchivedList = { id: number; title: string; archived_at: string; cards_count: number }
type ArchivedCard = {
  id: number
  title: string
  archived_at: string
  list: { id: number; title: string; archived: boolean }
}

const SECTION = 'text-xs font-semibold uppercase tracking-wide text-muted-foreground'

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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Head title={`Arquivados · ${board.title}`} />

      <PageHeader>
        <Link
          href={`/boards/${board.id}`}
          className="min-w-0 shrink truncate text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {board.title}
        </Link>

        <span aria-hidden className="text-xs text-muted-foreground/40">
          /
        </span>

        <h1 className="shrink-0 text-sm font-semibold tracking-tight">Arquivados</h1>
      </PageHeader>

      <p className="text-sm text-muted-foreground">
        Nada aqui foi apagado. Restaurar devolve o item ao board, no fim da coluna.
      </p>

      {empty && (
        <p className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          <ArchiveIcon aria-hidden className="size-5" />
          Nenhuma lista e nenhum card arquivado neste board.
        </p>
      )}

      {lists.length > 0 && (
        <section className="mt-6">
          <h2 className={SECTION}>Listas</h2>
          <ul className="mt-2 divide-y rounded-xl border bg-card">
            {lists.map((list) => (
              <li key={list.id} className="flex items-center gap-3 px-3 py-2.5">
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
        <section className="mt-6">
          <h2 className={SECTION}>Cards</h2>
          <ul className="mt-2 divide-y rounded-xl border bg-card">
            {cards.map((card) => (
              <li key={card.id} className="flex items-center gap-3 px-3 py-2.5">
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
