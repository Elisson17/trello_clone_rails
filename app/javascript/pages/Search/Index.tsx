import { Head, Link } from '@inertiajs/react'
import { SearchIcon } from 'lucide-react'

import { BoardCard } from '@/components/BoardCard'
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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Head title={term ? `Busca: ${term}` : 'Busca'} />

      <h1 className="text-2xl font-semibold tracking-tight">
        {term ? `Resultados para “${term}”` : 'Busca'}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {term
          ? `${total} ${total === 1 ? 'resultado' : 'resultados'} em boards e cards que você pode ver.`
          : 'Digite no campo do header para buscar por título de board ou de card.'}
      </p>

      {term && total === 0 && (
        <p className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          <SearchIcon aria-hidden className="size-5" />
          Nada com esse título. A busca casa começo de palavra — tente um pedaço menor.
        </p>
      )}

      {boards.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-muted-foreground">Boards</h2>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {boards.map((board) => (
              <li key={board.id}>
                <BoardCard
                  id={board.id}
                  title={board.title}
                  background={board.background}
                  meta={board.workspace.name}
                />
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
              <li key={card.id}>
                <Link
                  href={`/cards/${card.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'h-8 w-1.5 shrink-0 rounded-full',
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

                  <span className="shrink-0 text-xs text-muted-foreground">#{card.id}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
