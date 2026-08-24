import { Head, Link, router, useForm } from '@inertiajs/react'
import { MailIcon, Trash2Icon } from 'lucide-react'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Input } from '@/components/Input'
import { PageHeader } from '@/components/PageHeader'
import { ROLE_LABELS, RoleBadge } from '@/components/RoleBadge'
import { Select } from '@/components/Select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { accentStyle } from '@/lib/accent'
import type { Member, PendingInvitation, WorkspaceRole } from '@/types/inertia'

type Props = {
  workspace: { id: number; slug: string; name: string; personal: boolean }
  members: Member[]
  invitations: PendingInvitation[]
  roles: WorkspaceRole[]
  can: { manage_members: boolean }
}

export default function WorkspaceMembers({ workspace, members, invitations, roles, can }: Props) {
  const base = `/workspaces/${workspace.slug}`

  return (
    <div className="mx-auto max-w-2xl px-4 py-8" style={accentStyle(workspace.slug)}>
      <Head title={`Membros · ${workspace.name}`} />

      <PageHeader>
        <Link
          href={base}
          className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {workspace.name}
        </Link>

        <span aria-hidden className="text-xs text-muted-foreground/40">
          /
        </span>

        <h1 className="min-w-0 truncate text-sm font-semibold tracking-tight">Membros</h1>
      </PageHeader>

      <p className="text-sm text-muted-foreground">
        {can.manage_members
          ? 'Owners e admins convidam, mudam papéis e removem pessoas.'
          : 'Só owners e admins podem convidar ou mudar papéis.'}
      </p>

      {can.manage_members && <InviteForm base={base} roles={roles} />}

      <ul className="mt-5 divide-y rounded-xl border bg-card">
        {members.map((member) => (
          <MemberRow key={member.id} base={base} member={member} roles={roles} />
        ))}
      </ul>

      {invitations.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold">Convites pendentes</h2>
          <ul className="mt-2 divide-y rounded-xl border bg-card">
            {invitations.map((invitation) => (
              <InvitationRow key={invitation.id} base={base} invitation={invitation} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function InviteForm({ base, roles }: { base: string; roles: WorkspaceRole[] }) {
  const invite = useForm({ email_address: '', role: 'member' as WorkspaceRole })

  return (
    <form
      className="mt-6 flex flex-wrap items-end gap-2 rounded-xl border bg-card p-4"
      onSubmit={(event) => {
        event.preventDefault()
        invite.post(`${base}/invitations`, {
          preserveScroll: true,
          onSuccess: () => invite.reset(),
        })
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
        {invite.processing ? 'Enviando…' : 'Enviar convite'}
      </Button>
    </form>
  )
}

function MemberRow({
  base,
  member,
  roles,
}: {
  base: string
  member: Member
  roles: WorkspaceRole[]
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <Avatar className="size-9">
        <AvatarImage src={member.user.avatar_url ?? undefined} alt="" />
        <AvatarFallback>{member.user.name[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">
          {member.user.name}
          {member.is_self && <span className="text-muted-foreground"> (você)</span>}
        </span>
        <span className="block truncate text-xs text-muted-foreground">{member.user.email}</span>
      </span>

      <div className="flex w-32 shrink-0 justify-end">
        {member.can_update ? (
          <Select
            aria-label={`Papel de ${member.user.name}`}
            fieldClassName="w-32"
            value={member.role}
            onChange={(event) =>
              router.patch(
                `${base}/memberships/${member.id}`,
                { role: event.target.value },
                { preserveScroll: true },
              )
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
      </div>

      <div className="flex w-9 shrink-0 justify-end">
        {member.can_destroy && (
          <ConfirmDialog
            title={member.is_self ? 'Sair do workspace?' : `Remover ${member.user.name}?`}
            description={
              member.is_self
                ? 'Você perde o acesso ao workspace. Para voltar, alguém precisa convidar você de novo.'
                : `${member.user.name} perde o acesso ao workspace imediatamente.`
            }
            confirmLabel={member.is_self ? 'Sair' : 'Remover'}
            destructive
            onConfirm={() => router.delete(`${base}/memberships/${member.id}`)}
          >
            <Button
              variant="ghost"
              size="icon"
              aria-label={member.is_self ? 'Sair do workspace' : `Remover ${member.user.name}`}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2Icon />
            </Button>
          </ConfirmDialog>
        )}
      </div>
    </li>
  )
}

function InvitationRow({ base, invitation }: { base: string; invitation: PendingInvitation }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"
      >
        <MailIcon className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{invitation.email_address}</span>
        <span className="block text-xs text-muted-foreground">
          {invitation.expired
            ? 'Expirado — envie um novo convite'
            : `Expira em ${new Date(invitation.expires_at).toLocaleDateString('pt-BR')}`}
        </span>
      </span>

      <div className="flex w-32 shrink-0 justify-end">
        <RoleBadge role={invitation.role} />
      </div>

      <div className="flex w-9 shrink-0 justify-end">
        <ConfirmDialog
          title="Cancelar convite?"
          description={`O link enviado para ${invitation.email_address} deixa de funcionar.`}
          confirmLabel="Cancelar convite"
          destructive
          onConfirm={() => router.delete(`${base}/invitations/${invitation.id}`)}
        >
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Cancelar convite de ${invitation.email_address}`}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2Icon />
          </Button>
        </ConfirmDialog>
      </div>
    </li>
  )
}
