// Props que o ApplicationController compartilha em toda página (inertia_share).
export type SharedUser = {
  id: number
  name: string
  email: string
  time_zone: string
  avatar_url: string | null
}

export type NavWorkspace = { slug: string; name: string }
export type NavBoard = { id: number; title: string; workspace_slug: string }

export type SharedProps = {
  auth: { user: SharedUser | null }
  flash: { notice: string | null; alert: string | null }
  unread_notifications_count: number
  nav: { workspaces: NavWorkspace[]; recent_boards: NavBoard[] } | null
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

export type BoardCardPayload = {
  id: number
  title: string
  background: BoardBackground
  visibility: BoardVisibility
  updated_at: string
  workspace: { slug: string; name: string }
  owner: { id: number; name: string; avatar_url: string | null }
  last_visited_at: string | null
  members: { avatars: { id: number; name: string; avatar_url: string | null }[]; total: number }
  preview: { list_id: number; count: number; colors: BoardBackground[] }[]
  counts: { lists: number; cards: number; overdue: number }
}

export type LabelPayload = { id: number; name: string; color: BoardBackground }

export type BoardMember = {
  id: number
  role: 'admin' | 'member' | 'viewer'
  user: { id: number; name: string; email: string; avatar_url: string | null }
}

export type CardPayload = {
  id: number
  title: string
  position: number
  due_at: string | null
  completed: boolean
  overdue: boolean
  cover_color: BoardBackground | null
  comments_count: number
  attachments_count: number
  has_description: boolean
  labels: LabelPayload[]
  assignees: { id: number; name: string; avatar_url: string | null }[]
  checklist: { done: number; total: number } | null
}

export type ChecklistPayload = {
  id: number
  title: string
  done: number
  total: number
  items: { id: number; content: string; completed: boolean }[]
}

export type CommentPayload = {
  id: number
  body: string
  created_at: string
  edited: boolean
  author: { id: number; name: string; avatar_url: string | null }
  can_edit: boolean
  can_destroy: boolean
}

export type AttachmentPayload = {
  id: number
  filename: string
  byte_size: number
  content_type: string
  url: string
}

/** Prop extra da página do board quando a rota é `/cards/:id`: o modal do card. */
export type CardDetail = {
  id: number
  list: { id: number; title: string }
  title: string
  description: string | null
  due_at: string | null
  completed: boolean
  overdue: boolean
  cover_color: BoardBackground | null
  created_at: string
  creator: { id: number; name: string }
  label_ids: number[]
  assignee_ids: number[]
  checklists: ChecklistPayload[]
  comments: CommentPayload[]
  attachments: AttachmentPayload[]
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
  members: BoardMember[]
  workspace_members: { id: number; name: string; avatar_url: string | null }[]
  labels: LabelPayload[]
  lists: ListPayload[]
  cards_count: number
}

/** Uma linha do feed. O texto da frase é montado no front a partir de `action` + `metadata`. */
export type ActivityPayload = {
  id: number
  action: string
  metadata: Record<string, string | string[] | number | null>
  created_at: string
  /** Nulo quando foi o sistema: o lembrete de prazo não tem autor. */
  actor: { id: number; name: string; avatar_url: string | null } | null
  url: string | null
}

/** Página do feed. Vai e volta por `?page=`, sem estado no cliente. */
export type FeedPage<T> = {
  items: T[]
  page: number
  prev_page: number | null
  next_page: number | null
}

export type NotificationPayload = {
  id: number
  read: boolean
  created_at: string
  board: { id: number; title: string }
  activity: ActivityPayload
}
