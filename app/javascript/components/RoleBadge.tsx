import { Badge } from '@/components/ui/badge'
import type { WorkspaceRole } from '@/types/inertia'

export const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Membro',
}

// Nenhum deles é `default`: papel é rótulo, não ação, e o preenchido primário fazia
// "Owner" competir com os botões da tela.
const VARIANTS: Record<WorkspaceRole, 'secondary' | 'outline'> = {
  owner: 'secondary',
  admin: 'outline',
  member: 'outline',
}

export function RoleBadge({ role }: { role: WorkspaceRole }) {
  return (
    <Badge variant={VARIANTS[role]} className={role === 'member' ? 'text-muted-foreground' : ''}>
      {ROLE_LABELS[role]}
    </Badge>
  )
}
