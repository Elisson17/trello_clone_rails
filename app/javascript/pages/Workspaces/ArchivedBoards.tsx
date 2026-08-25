import { Head, Link, router } from '@inertiajs/react'
import { RotateCcwIcon } from 'lucide-react'

import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { accentStyle } from '@/lib/accent'
import { BOARD_THEME } from '@/lib/board-theme'
import { cn } from '@/lib/utils'
import type { BoardSummary } from '@/types/inertia'

type Props = {
  workspace: { slug: string; name: string }
  boards: BoardSummary[]
}

export default function ArchivedBoards({ workspace, boards }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8" style={accentStyle(workspace.slug)}>
      <Head title={`Arquivados · ${workspace.name}`} />

      <PageHeader>
        <Link
          href={`/workspaces/${workspace.slug}`}
          className="min-w-0 shrink truncate text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {workspace.name}
        </Link>

        <span aria-hidden className="text-xs text-muted-foreground/40">
          /
        </span>

        <h1 className="shrink-0 text-sm font-semibold tracking-tight">Boards arquivados</h1>
      </PageHeader>

      <p className="text-sm text-muted-foreground">
        Arquivar não apaga nada. Restaure quando quiser de volta ao workspace.
      </p>

      {boards.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          Nada arquivado por aqui.
        </p>
      ) : (
        // Mesma grade da home, com o tile em repouso: superfície recuada, sem link, e a
        // única ação é restaurar.
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <li
              key={board.id}
              className="flex h-full flex-col gap-3 rounded-lg border bg-secondary/60 p-3"
            >
              <div className="flex items-start gap-2">
                <span
                  aria-hidden
                  className={cn(
                    'mt-1 size-2 shrink-0 rounded-full opacity-60',
                    BOARD_THEME[board.background].rail,
                  )}
                />
                <span className="min-w-0 flex-1 truncate font-medium text-muted-foreground">
                  {board.title}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-auto self-start bg-card"
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
