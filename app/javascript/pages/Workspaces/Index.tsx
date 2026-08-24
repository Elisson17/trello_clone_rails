import { Head, Link } from '@inertiajs/react'
import { BoardCard } from '@/components/BoardCard'
import { MemberAvatars } from '@/components/MemberAvatars'
import { NewWorkspaceDialog } from '@/components/NewWorkspaceDialog'
import { accentStyle } from '@/lib/accent'
import type { BoardBackground, WorkspaceRole, WorkspaceSummary } from '@/types/inertia'

type RecentBoard = {
  id: number
  title: string
  background: BoardBackground
  workspace: { slug: string; name: string }
}

const ROLE_NOTE: Record<WorkspaceRole, string> = {
  owner: 'Você é owner',
  admin: 'Você é admin',
  member: 'Você é membro',
}

export default function WorkspacesIndex({
  workspaces,
  recent_boards: recentBoards,
}: {
  workspaces: WorkspaceSummary[]
  recent_boards: RecentBoard[]
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Head title="Workspaces" />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada workspace agrupa boards e membros.
          </p>
        </div>

        <NewWorkspaceDialog />
      </div>

      {recentBoards.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-muted-foreground">Boards recentes</h2>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {recentBoards.map((board) => (
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

      {workspaces.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <WorkspaceCard workspace={workspace} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function WorkspaceCard({ workspace }: { workspace: WorkspaceSummary }) {
  return (
    <Link
      href={`/workspaces/${workspace.slug}`}
      style={accentStyle(workspace.slug)}
      className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-xl border bg-card p-4 transition-[box-shadow,transform,border-color] hover:-translate-y-0.5 hover:border-[var(--accent-solid)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* Faixa de acento: a mesma cor identifica este workspace nas outras telas. */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 bg-[var(--accent-solid)] opacity-70 transition-opacity group-hover:opacity-100"
      />

      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{workspace.name}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {workspace.role && ROLE_NOTE[workspace.role]}
            {workspace.personal && ' · espaço pessoal'}
          </p>
        </div>

        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent-solid)]"
        >
          {workspace.name[0]?.toUpperCase()}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pl-2">
        <MemberAvatars users={workspace.members_preview} total={workspace.members_count} />
        <span className="text-xs text-muted-foreground">
          {workspace.members_count === 1 ? '1 membro' : `${workspace.members_count} membros`}
        </span>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="mt-8 rounded-xl border border-dashed px-6 py-14 text-center">
      <p className="font-medium">Nenhum workspace ainda</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Crie um para começar a organizar boards e convidar quem trabalha com você.
      </p>
      <div className="mt-5 flex justify-center">
        <NewWorkspaceDialog />
      </div>
    </div>
  )
}
