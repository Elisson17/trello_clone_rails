// Props que o ApplicationController compartilha em toda página (inertia_share).
export type SharedUser = {
  id: number
  name: string
  email: string
  time_zone: string
  avatar_url: string | null
}

export type SharedProps = {
  auth: { user: SharedUser | null }
  flash: { notice: string | null; alert: string | null }
}

export type WorkspaceRole = 'owner' | 'admin' | 'member'

export type WorkspaceSummary = {
  id: number
  slug: string
  name: string
  personal: boolean
  members_count: number
  role: WorkspaceRole | null
  membership_id: number | null
  members_preview: { id: number; name: string; avatar_url: string | null }[]
}

export type Member = {
  id: number
  role: WorkspaceRole
  is_self: boolean
  can_update: boolean
  can_destroy: boolean
  user: { id: number; name: string; email: string; avatar_url: string | null }
}

export type PendingInvitation = {
  id: number
  email_address: string
  role: WorkspaceRole
  expires_at: string
  expired: boolean
}

export type BoardBackground = 'slate' | 'rose' | 'amber' | 'emerald' | 'sky' | 'violet'
export type BoardVisibility = 'private_to_members' | 'workspace_wide'

export type BoardSummary = {
  id: number
  title: string
  background: BoardBackground
  visibility: BoardVisibility
  lists_count: number
}

export type CardPayload = {
  id: number
  title: string
  position: number
  due_at: string | null
  completed: boolean
  overdue: boolean
  cover_color: string | null
  comments_count: number
}

export type ListPayload = {
  id: number
  title: string
  position: number
  cards: CardPayload[]
}

export type BoardPayload = {
  id: number
  title: string
  description: string | null
  visibility: BoardVisibility
  background: BoardBackground
  archived: boolean
  workspace: { slug: string; name: string }
  lists: ListPayload[]
  cards_count: number
}
