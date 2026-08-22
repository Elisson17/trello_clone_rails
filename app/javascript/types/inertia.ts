// Props que o ApplicationController compartilha em toda página (inertia_share).
export type SharedUser = {
  id: number
  name: string
  email_address: string
}

export type SharedProps = {
  auth: { user: SharedUser | null }
  flash: { notice: string | null; alert: string | null }
}
