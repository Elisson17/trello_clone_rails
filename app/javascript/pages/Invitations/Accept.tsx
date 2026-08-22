import { Link, router } from '@inertiajs/react'

import { AuthShell } from '@/components/AuthShell'
import { ROLE_LABELS } from '@/components/RoleBadge'
import { Button } from '@/components/ui/button'
import type { WorkspaceRole } from '@/types/inertia'

type InvitationState = 'ready' | 'signed_out' | 'wrong_email' | 'expired' | 'accepted'

type Props = {
  invitation: {
    token: string
    email_address: string
    role: WorkspaceRole
    workspace_name: string
    invited_by_name: string
    expires_at: string
  }
  state: InvitationState
}

const MESSAGES: Record<InvitationState, string> = {
  ready: 'É só confirmar para entrar no workspace.',
  signed_out: 'Entre ou crie a conta com esse e-mail para aceitar o convite.',
  wrong_email: 'Você está logado com outra conta. Saia e entre com o e-mail convidado.',
  expired: 'Este convite expirou. Peça um novo para quem convidou você.',
  accepted: 'Este convite já foi aceito.',
}

export default function InvitationsAccept({ invitation, state }: Props) {
  return (
    <AuthShell
      title="Você foi convidado"
      description={`${invitation.invited_by_name} convidou você para "${invitation.workspace_name}" como ${ROLE_LABELS[invitation.role]}.`}
    >
      <p className="text-sm text-muted-foreground">
        Convite para <strong className="text-foreground">{invitation.email_address}</strong>.{' '}
        {MESSAGES[state]}
      </p>

      {state === 'ready' && (
        <Button
          className="mt-4 w-full"
          onClick={() => router.post(`/invitations/${invitation.token}/accept`)}
        >
          Aceitar convite
        </Button>
      )}

      {state === 'signed_out' && (
        <div className="mt-4 flex gap-2">
          <Button asChild className="flex-1">
            <Link href="/users/sign_in">Entrar</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/users/sign_up">Criar conta</Link>
          </Button>
        </div>
      )}

      {state === 'wrong_email' && (
        <Button asChild variant="outline" className="mt-4 w-full">
          <Link href="/users/sign_out" method="delete" as="button">
            Sair desta conta
          </Link>
        </Button>
      )}
    </AuthShell>
  )
}
