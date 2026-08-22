import { Badge } from '@/components/ui/badge'
import type { WorkspaceRole } from '@/types/inertia'

export const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Membro',
}

const VARIANTS: Record<WorkspaceRole, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  admin: 'secondary',
  member: 'outline',
}

export function RoleBadge({ role }: { role: WorkspaceRole }) {
  return <Badge variant={VARIANTS[role]}>{ROLE_LABELS[role]}</Badge>
}
