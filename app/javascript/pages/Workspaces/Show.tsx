import { Head, Link, router, useForm } from '@inertiajs/react'
import { UsersIcon } from 'lucide-react'

import { Input } from '@/components/Input'
import { RoleBadge } from '@/components/RoleBadge'
import { Button } from '@/components/ui/button'
import type { WorkspaceSummary } from '@/types/inertia'

type Can = { update: boolean; destroy: boolean; manage_members: boolean; leave: boolean }

export default function WorkspaceShow({
  workspace,
  can,
}: {
  workspace: WorkspaceSummary
  can: Can
}) {
  const form = useForm({ name: workspace.name })

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Head title={workspace.name} />

      <Link href="/workspaces" className="text-sm text-muted-foreground hover:underline">
        ← Workspaces
      </Link>

      <div className="mt-2 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{workspace.name}</h1>
        {workspace.role && <RoleBadge role={workspace.role} />}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Seus boards deste workspace aparecem aqui a partir da etapa 4.
      </p>

      <Link
        href={`/workspaces/${workspace.slug}/memberships`}
        className="mt-6 flex items-center justify-between rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-accent"
      >
        <span className="flex items-center gap-2 font-medium">
          <UsersIcon className="size-4" />
          Membros
        </span>
        <span className="text-sm text-muted-foreground">{workspace.members_count}</span>
      </Link>

      {can.update && (
        <form
          className="mt-6 flex items-end gap-2 rounded-2xl border bg-card p-4"
          onSubmit={(event) => {
            event.preventDefault()
            form.patch(`/workspaces/${workspace.slug}`)
          }}
        >
          <Input
            label="Nome do workspace"
            required
            maxLength={80}
            fieldClassName="flex-1"
            value={form.data.name}
            error={form.errors.name}
            onChange={(event) => form.setData('name', event.target.value)}
          />
          <Button type="submit" disabled={form.processing}>
            Salvar
          </Button>
        </form>
      )}

      {(can.leave || can.destroy) && (
        <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-destructive/30 p-4">
          {can.leave && (
            <Button
              variant="outline"
              onClick={() => {
                if (!confirm(`Sair de "${workspace.name}"?`)) return
                router.delete(
                  `/workspaces/${workspace.slug}/memberships/${workspace.membership_id}`,
                )
              }}
            >
              Sair do workspace
            </Button>
          )}

          {can.destroy && (
            <Button
              variant="destructive"
              onClick={() => {
                if (!confirm(`Excluir "${workspace.name}" e tudo dentro dele?`)) return
                router.delete(`/workspaces/${workspace.slug}`)
              }}
            >
              Excluir workspace
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
