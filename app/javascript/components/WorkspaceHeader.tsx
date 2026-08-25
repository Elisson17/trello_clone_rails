import { Link, router, useForm } from '@inertiajs/react'
import { ArchiveIcon, MoreHorizontalIcon, UsersIcon } from 'lucide-react'
import { useState } from 'react'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Input } from '@/components/Input'
import { MemberAvatars } from '@/components/MemberAvatars'
import { RoleBadge } from '@/components/RoleBadge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { accentStyle } from '@/lib/accent'
import type { WorkspaceSummary } from '@/types/inertia'

type Can = {
  update: boolean
  destroy: boolean
  manage_members: boolean
  leave: boolean
  create_board: boolean
}

export function WorkspaceHeader({
  workspace,
  can,
  archivedCount,
}: {
  workspace: WorkspaceSummary
  can: Can
  archivedCount: number
}) {
  const [renaming, setRenaming] = useState(false)
  const form = useForm({ name: workspace.name })
  const base = `/workspaces/${workspace.slug}`

  return (
    <header className="flex flex-wrap items-center gap-3" style={accentStyle(workspace.slug)}>
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-lg bg-(--accent-soft) text-base font-bold text-(--accent-solid)"
      >
        {workspace.name[0]?.toUpperCase()}
      </span>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-semibold tracking-tight">{workspace.name}</h1>
        <div className="mt-0.5 flex items-center gap-2">
          {workspace.role && <RoleBadge role={workspace.role} />}
          {workspace.personal && (
            <span className="text-xs text-muted-foreground">espaço pessoal</span>
          )}
        </div>
      </div>

      <Link
        href={`${base}/memberships`}
        className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <UsersIcon className="size-4 text-muted-foreground" />
        Membros
        <MemberAvatars users={workspace.members_preview} total={workspace.members_count} />
      </Link>

      {archivedCount > 0 && (
        <Link
          href={`${base}/boards`}
          className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArchiveIcon className="size-4 text-muted-foreground" />
          Arquivados
          <span className="tabular-nums text-muted-foreground">{archivedCount}</span>
        </Link>
      )}

      {(can.update || can.leave || can.destroy) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Gerenciar workspace">
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {can.update && (
              <DropdownMenuItem onSelect={() => setRenaming(true)}>Renomear</DropdownMenuItem>
            )}

            {can.leave && (
              <ConfirmDialog
                title={`Sair de ${workspace.name}?`}
                description="Você perde o acesso ao workspace. Para voltar, alguém precisa convidar você de novo."
                confirmLabel="Sair"
                destructive
                onConfirm={() => router.delete(`${base}/memberships/${workspace.membership_id}`)}
              >
                <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                  Sair do workspace
                </DropdownMenuItem>
              </ConfirmDialog>
            )}

            {can.destroy && (
              <ConfirmDialog
                title={`Excluir ${workspace.name}?`}
                description="O workspace, seus membros e seus convites são apagados. Não dá para desfazer."
                confirmLabel="Excluir workspace"
                destructive
                onConfirm={() => router.delete(base)}
              >
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(event) => event.preventDefault()}
                >
                  Excluir workspace
                </DropdownMenuItem>
              </ConfirmDialog>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={renaming} onOpenChange={setRenaming}>
        <DialogContent className="sm:max-w-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              form.patch(base, { preserveScroll: true, onSuccess: () => setRenaming(false) })
            }}
          >
            <DialogHeader>
              <DialogTitle>Renomear workspace</DialogTitle>
            </DialogHeader>

            <div className="py-5">
              <Input
                label="Nome"
                required
                maxLength={80}
                value={form.data.name}
                error={form.errors.name}
                onChange={(event) => form.setData('name', event.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={form.processing}>
                {form.processing ? 'Salvando…' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}
