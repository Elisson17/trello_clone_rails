import { Link, router } from '@inertiajs/react'

import { AuthShell } from '@/components/AuthShell'
import { ROLE_LABELS } from '@/components/RoleBadge'
import { Button } from '@/components/ui/button'
import { relativeTime } from '@/lib/card-format'
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
  const live = state === 'ready' || state === 'signed_out' || state === 'wrong_email'

  return (
    <AuthShell
      title="Você foi convidado"
      description={`${invitation.invited_by_name} convidou você para "${invitation.workspace_name}" como ${ROLE_LABELS[invitation.role]}.`}
    >
      <dl className="flex flex-col gap-2 rounded-lg border bg-secondary/50 p-3">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Convite para</dt>
          <dd className="min-w-0 truncate font-medium">{invitation.email_address}</dd>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">{live ? 'Expira' : 'Expirou'}</dt>
          <dd className="shrink-0">{relativeTime(invitation.expires_at)}</dd>
        </div>
      </dl>

      <p className="mt-4 text-muted-foreground">{MESSAGES[state]}</p>

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

      {/* Sem estes dois, os estados finais deixavam a pessoa numa tela sem saída. */}
      {state === 'accepted' && (
        <Button asChild className="mt-4 w-full">
          <Link href="/">Ir para os boards</Link>
        </Button>
      )}

      {state === 'expired' && (
        <Button asChild variant="outline" className="mt-4 w-full">
          <Link href="/">Voltar para o início</Link>
        </Button>
      )}
    </AuthShell>
  )
}
