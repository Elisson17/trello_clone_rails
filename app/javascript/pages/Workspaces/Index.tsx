import { Head, Link, useForm } from '@inertiajs/react'
import { PlusIcon, UsersIcon } from 'lucide-react'

import { Input } from '@/components/Input'
import { RoleBadge } from '@/components/RoleBadge'
import { Button } from '@/components/ui/button'
import type { WorkspaceSummary } from '@/types/inertia'

export default function WorkspacesIndex({ workspaces }: { workspaces: WorkspaceSummary[] }) {
  const form = useForm({ name: '' })

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Head title="Workspaces" />
      <h1 className="text-2xl font-semibold">Workspaces</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Cada workspace agrupa boards e membros. O pessoal é criado junto com a sua conta.
      </p>

      <form
        className="mt-6 flex items-end gap-2 rounded-2xl border bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault()
          form.post('/workspaces', { onSuccess: () => form.reset() })
        }}
      >
        <Input
          label="Novo workspace"
          required
          maxLength={80}
          placeholder="Time de produto"
          fieldClassName="flex-1"
          value={form.data.name}
          error={form.errors.name}
          onChange={(event) => form.setData('name', event.target.value)}
        />
        <Button type="submit" disabled={form.processing}>
          <PlusIcon />
          Criar
        </Button>
      </form>

      <ul className="mt-6 flex flex-col gap-2">
        {workspaces.map((workspace) => (
          <li key={workspace.id}>
            <Link
              href={`/workspaces/${workspace.slug}`}
              className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-accent"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{workspace.name}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <UsersIcon className="size-3" />
                  {workspace.members_count}
                  {workspace.personal && ' · pessoal'}
                </span>
              </span>
              {workspace.role && <RoleBadge role={workspace.role} />}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
