import { Head, Link, router, useForm } from '@inertiajs/react'
import { ArrowLeftIcon, LayoutGridIcon, UsersIcon } from 'lucide-react'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Input } from '@/components/Input'
import { MemberAvatars } from '@/components/MemberAvatars'
import { RoleBadge } from '@/components/RoleBadge'
import { Button } from '@/components/ui/button'
import { accentStyle } from '@/lib/accent'
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
  const base = `/workspaces/${workspace.slug}`
  const dirty = form.data.name.trim() !== workspace.name

  return (
    <div className="mx-auto max-w-2xl px-4 py-10" style={accentStyle(workspace.slug)}>
      <Head title={workspace.name} />

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        Workspaces
      </Link>

      <header className="mt-4 flex items-center gap-4">
        <span
          aria-hidden
          className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-lg font-bold text-[var(--accent-solid)]"
        >
          {workspace.name[0]?.toUpperCase()}
        </span>

        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{workspace.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            {workspace.role && <RoleBadge role={workspace.role} />}
            {workspace.personal && (
              <span className="text-xs text-muted-foreground">espaço pessoal</span>
            )}
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href={`${base}/memberships`}
          className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:border-[var(--accent-solid)] hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <UsersIcon className="size-4 text-muted-foreground" />
            Membros
          </span>
          <MemberAvatars users={workspace.members_preview} total={workspace.members_count} />
        </Link>

        <div className="flex items-center gap-2 rounded-xl border border-dashed px-4 py-3.5 text-sm text-muted-foreground">
          <LayoutGridIcon className="size-4" />
          Boards chegam na etapa 4
        </div>
      </div>

      {can.update && (
        <form
          className="mt-6 flex flex-wrap items-end gap-2 rounded-xl border bg-card p-4"
          onSubmit={(event) => {
            event.preventDefault()
            form.patch(base, { preserveScroll: true })
          }}
        >
          <Input
            label="Nome do workspace"
            required
            maxLength={80}
            fieldClassName="min-w-48 flex-1"
            value={form.data.name}
            error={form.errors.name}
            onChange={(event) => form.setData('name', event.target.value)}
          />
          <Button type="submit" disabled={!dirty || form.processing}>
            {form.processing ? 'Salvando…' : 'Salvar'}
          </Button>
        </form>
      )}

      {(can.leave || can.destroy) && (
        <section className="mt-6 rounded-xl border border-destructive/30 p-4">
          <h2 className="text-sm font-semibold">Zona de risco</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {can.destroy
              ? 'Excluir apaga o workspace e tudo que estiver dentro dele.'
              : 'Sair remove seu acesso a este workspace.'}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {can.leave && (
              <ConfirmDialog
                title={`Sair de ${workspace.name}?`}
                description="Você perde o acesso ao workspace. Para voltar, alguém precisa convidar você de novo."
                confirmLabel="Sair"
                destructive
                onConfirm={() => router.delete(`${base}/memberships/${workspace.membership_id}`)}
              >
                <Button variant="outline">Sair do workspace</Button>
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
                <Button variant="destructive">Excluir workspace</Button>
              </ConfirmDialog>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
