import { Head, Link, router, useForm } from '@inertiajs/react'
import { MailIcon, Trash2Icon } from 'lucide-react'

import { Input } from '@/components/Input'
import { ROLE_LABELS, RoleBadge } from '@/components/RoleBadge'
import { Select } from '@/components/Select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Member, PendingInvitation, WorkspaceRole } from '@/types/inertia'

type Props = {
  workspace: { id: number; slug: string; name: string; personal: boolean }
  members: Member[]
  invitations: PendingInvitation[]
  roles: WorkspaceRole[]
  can: { manage_members: boolean }
}

export default function WorkspaceMembers({ workspace, members, invitations, roles, can }: Props) {
  const invite = useForm({ email_address: '', role: 'member' as WorkspaceRole })
  const base = `/workspaces/${workspace.slug}`

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Head title={`Membros · ${workspace.name}`} />

      <Link href={base} className="text-sm text-muted-foreground hover:underline">
        ← {workspace.name}
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">Membros</h1>

      {can.manage_members && (
        <form
          className="mt-6 flex flex-wrap items-end gap-2 rounded-2xl border bg-card p-4"
          onSubmit={(event) => {
            event.preventDefault()
            invite.post(`${base}/invitations`, { onSuccess: () => invite.reset() })
          }}
        >
          <Input
            label="Convidar por e-mail"
            type="email"
            required
            placeholder="pessoa@empresa.com"
            fieldClassName="min-w-56 flex-1"
            value={invite.data.email_address}
            error={invite.errors.email_address}
            onChange={(event) => invite.setData('email_address', event.target.value)}
          />
          <Select
            label="Papel"
            fieldClassName="w-36"
            value={invite.data.role}
            error={invite.errors.role}
            onChange={(event) => invite.setData('role', event.target.value as WorkspaceRole)}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </Select>
          <Button type="submit" disabled={invite.processing}>
            <MailIcon />
            Convidar
          </Button>
        </form>
      )}

      <ul className="mt-6 flex flex-col gap-2">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-3"
          >
            <Avatar className="size-9">
              <AvatarImage src={member.user.avatar_url ?? undefined} alt="" />
              <AvatarFallback>{member.user.name[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>

            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">
                {member.user.name}
                {member.is_self && <span className="text-muted-foreground"> (você)</span>}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {member.user.email}
              </span>
            </span>

            {member.can_update ? (
              <Select
                aria-label={`Papel de ${member.user.name}`}
                fieldClassName="w-32"
                value={member.role}
                onChange={(event) =>
                  router.patch(`${base}/memberships/${member.id}`, { role: event.target.value })
                }
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </Select>
            ) : (
              <RoleBadge role={member.role} />
            )}

            {member.can_destroy && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={member.is_self ? 'Sair do workspace' : `Remover ${member.user.name}`}
                onClick={() => {
                  const question = member.is_self
                    ? `Sair de "${workspace.name}"?`
                    : `Remover ${member.user.name}?`
                  if (confirm(question)) router.delete(`${base}/memberships/${member.id}`)
                }}
              >
                <Trash2Icon />
              </Button>
            )}
          </li>
        ))}
      </ul>

      {invitations.length > 0 && (
        <>
          <h2 className="mt-8 font-semibold">Convites pendentes</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex items-center gap-3 rounded-xl border border-dashed px-4 py-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{invitation.email_address}</span>
                  <span className="block text-xs text-muted-foreground">
                    {invitation.expired
                      ? 'Expirado'
                      : `Expira em ${new Date(invitation.expires_at).toLocaleDateString('pt-BR')}`}
                  </span>
                </span>
                <RoleBadge role={invitation.role} />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Cancelar convite de ${invitation.email_address}`}
                  onClick={() => router.delete(`${base}/invitations/${invitation.id}`)}
                >
                  <Trash2Icon />
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
