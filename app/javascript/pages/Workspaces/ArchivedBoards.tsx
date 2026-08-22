import { Head, Link, router } from '@inertiajs/react'
import { ArrowLeftIcon, RotateCcwIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { BOARD_THEME } from '@/lib/board-theme'
import { cn } from '@/lib/utils'
import type { BoardSummary } from '@/types/inertia'

type Props = {
  workspace: { slug: string; name: string }
  boards: BoardSummary[]
}

export default function ArchivedBoards({ workspace, boards }: Props) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Head title={`Arquivados · ${workspace.name}`} />

      <Link
        href={`/workspaces/${workspace.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        {workspace.name}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Boards arquivados</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Arquivar não apaga nada. Restaure quando quiser de volta ao workspace.
      </p>

      {boards.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          Nada arquivado por aqui.
        </p>
      ) : (
        <ul className="mt-6 divide-y rounded-xl border bg-card">
          {boards.map((board) => (
            <li key={board.id} className="flex items-center gap-3 px-4 py-3">
              <span
                aria-hidden
                className={cn(
                  'h-8 w-1.5 shrink-0 rounded-full opacity-60',
                  BOARD_THEME[board.background].rail,
                )}
              />
              <span className="min-w-0 flex-1 truncate font-medium">{board.title}</span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => router.delete(`/boards/${board.id}/archive`)}
              >
                <RotateCcwIcon />
                Restaurar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
