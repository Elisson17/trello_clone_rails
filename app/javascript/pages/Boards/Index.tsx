import { Head, usePage } from '@inertiajs/react'
import { useMemo, useState } from 'react'

import { BoardGridCard } from '@/components/BoardGridCard'
import { NewBoardDialog } from '@/components/NewBoardDialog'
import { Select } from '@/components/Select'
import { Button } from '@/components/ui/button'
import { WorkspaceHeader } from '@/components/WorkspaceHeader'
import { accentStyle } from '@/lib/accent'
import {
  type BoardsSort,
  EMPTY_BOARDS_FILTER,
  filterBoards,
  isFilteringBoards,
  toggleSlug,
} from '@/lib/boards-filter'
import { cn } from '@/lib/utils'
import type {
  BoardBackground,
  BoardCardPayload,
  SharedProps,
  WorkspaceSummary,
} from '@/types/inertia'

type Can = {
  update: boolean
  destroy: boolean
  manage_members: boolean
  leave: boolean
  create_board: boolean
}

type Props = {
  boards: BoardCardPayload[]
  backgrounds: BoardBackground[]
  workspace?: WorkspaceSummary
  can?: Can
  archived_count?: number
}

export default function BoardsIndex({
  boards,
  backgrounds,
  workspace,
  can,
  archived_count: archivedCount = 0,
}: Props) {
  const { props } = usePage<SharedProps>()
  const [filter, setFilter] = useState(EMPTY_BOARDS_FILTER)

  const currentUserId = props.auth.user?.id ?? 0
  const workspaces = props.nav?.workspaces ?? []

  const found = useMemo(
    () => filterBoards(boards, filter, currentUserId),
    [boards, filter, currentUserId],
  )

  const canCreate = workspace ? can?.create_board : workspaces.length > 0

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Head title={workspace ? workspace.name : 'Boards'} />

      {workspace && can ? (
        <WorkspaceHeader workspace={workspace} can={can} archivedCount={archivedCount} />
      ) : (
        <h1 className="text-xl font-semibold tracking-tight">Boards</h1>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={filter.text}
          placeholder="Buscar board"
          aria-label="Buscar board"
          onChange={(event) => setFilter({ ...filter, text: event.target.value })}
          className="h-9 min-w-48 flex-1 rounded-md border bg-card px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
        />

        <Button
          type="button"
          variant={filter.mineOnly ? 'default' : 'outline'}
          aria-pressed={filter.mineOnly}
          onClick={() => setFilter({ ...filter, mineOnly: !filter.mineOnly })}
        >
          Só meus
        </Button>

        <Select
          aria-label="Ordenar por"
          value={filter.sort}
          onChange={(event) => setFilter({ ...filter, sort: event.target.value as BoardsSort })}
        >
          <option value="recent">Último acesso</option>
          <option value="name">Nome</option>
          <option value="updated">Atualizado</option>
        </Select>

        {canCreate && (
          <NewBoardDialog
            backgrounds={backgrounds}
            workspaceSlug={workspace?.slug}
            workspaces={workspaces}
          />
        )}
      </div>

      {/* Dentro de um workspace o chip repetiria a única resposta possível. */}
      {!workspace && workspaces.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {workspaces.map((item) => {
            const on = filter.workspaceSlugs.includes(item.slug)

            return (
              <button
                key={item.slug}
                type="button"
                aria-pressed={on}
                style={accentStyle(item.slug)}
                onClick={() =>
                  setFilter({
                    ...filter,
                    workspaceSlugs: toggleSlug(filter.workspaceSlugs, item.slug),
                  })
                }
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors',
                  on ? 'border-[var(--accent-solid)] bg-accent' : 'text-muted-foreground',
                )}
              >
                <span aria-hidden className="size-1.5 rounded-full bg-[var(--accent-solid)]" />
                {item.name}
              </button>
            )
          })}
        </div>
      )}

      {found.length > 0 ? (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {found.map((item) => (
            <li key={item.id}>
              <BoardGridCard board={item} showWorkspace={!workspace} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed px-6 py-14 text-center">
          {isFilteringBoards(filter) ? (
            <>
              <p className="font-medium">Nenhum board com esse filtro</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setFilter({ ...EMPTY_BOARDS_FILTER, sort: filter.sort })}
              >
                Limpar filtro
              </Button>
            </>
          ) : (
            <>
              <p className="font-medium">Nenhum board ainda</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Crie o primeiro board e ele já vem com as listas A fazer, Fazendo e Feito.
              </p>
              {canCreate && (
                <div className="mt-5 flex justify-center">
                  <NewBoardDialog
                    backgrounds={backgrounds}
                    workspaceSlug={workspace?.slug}
                    workspaces={workspaces}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
