import { Head, Link } from '@inertiajs/react'
import { SearchIcon } from 'lucide-react'

import { BoardCard } from '@/components/BoardCard'
import { PageHeader } from '@/components/PageHeader'
import { BOARD_THEME } from '@/lib/board-theme'
import { cn } from '@/lib/utils'
import type { BoardBackground } from '@/types/inertia'

type BoardResult = {
  id: number
  title: string
  background: BoardBackground
  workspace: { slug: string; name: string }
}

type CardResult = {
  id: number
  title: string
  completed: boolean
  due_at: string | null
  list: { id: number; title: string }
  board: { id: number; title: string; background: BoardBackground }
}

export default function SearchIndex({
  term,
  boards,
  cards,
}: {
  term: string
  boards: BoardResult[]
  cards: CardResult[]
}) {
  const total = boards.length + cards.length

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Head title={term ? `Busca: ${term}` : 'Busca'} />

      <PageHeader>
        <h1 className="shrink-0 text-sm font-semibold tracking-tight">Busca</h1>

        {term && (
          <>
            <span aria-hidden className="text-xs text-muted-foreground/40">
              /
            </span>
            <p className="min-w-0 truncate text-xs text-muted-foreground">
              {total} {total === 1 ? 'resultado' : 'resultados'} para “{term}”
            </p>
          </>
        )}
      </PageHeader>

      <p className="text-sm text-muted-foreground">
        {term
          ? 'Boards e cards que você pode ver, por título.'
          : 'Digite no campo da navegação para buscar por título de board ou de card.'}
      </p>

      {term && total === 0 && (
        <p className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          <SearchIcon aria-hidden className="size-5" />
          Nada com esse título. A busca casa começo de palavra — tente um pedaço menor.
        </p>
      )}

      {boards.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Boards
          </h2>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {boards.map((board) => (
              <li key={board.id}>
                <BoardCard
                  id={board.id}
                  title={board.title}
                  background={board.background}
                  meta={board.workspace.name}
                  accentSeed={board.workspace.slug}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {cards.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cards
          </h2>
          <ul className="mt-2 divide-y rounded-xl border bg-card">
            {cards.map((card) => (
              <li key={card.id}>
                <Link
                  href={`/cards/${card.id}`}
                  className="flex items-start gap-2 px-3 py-2.5 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'mt-1 size-2 shrink-0 rounded-full',
                      BOARD_THEME[card.board.background].rail,
                    )}
                  />

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block truncate font-medium',
                        card.completed && 'text-muted-foreground line-through',
                      )}
                    >
                      {card.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {card.board.title} · {card.list.title}
                    </span>
                  </span>

                  <span className="mt-0.5 shrink-0 text-xs tabular-nums text-muted-foreground/70">
                    #{card.id}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
