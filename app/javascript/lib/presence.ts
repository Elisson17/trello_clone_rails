export type PresenceUser = { id: number; name: string; avatar_url: string | null }

export type PresenceEvent =
  | { type: 'presence.join'; sid: string; user: PresenceUser }
  | { type: 'presence.leave'; sid: string }
  | { type: 'presence.state'; sid: string; user: PresenceUser; active: boolean }

/** Uma entrada por conexão, não por pessoa: a mesma pessoa em duas abas são dois `sid`. */
export type PresenceState = Record<string, { user: PresenceUser; active: boolean }>

export const EMPTY_PRESENCE: PresenceState = {}

export function presenceReducer(state: PresenceState, event: PresenceEvent): PresenceState {
  if (event.type === 'presence.leave') {
    if (!(event.sid in state)) return state

    const next = { ...state }
    delete next[event.sid]

    return next
  }

  // `join` entra ocioso: o estado real chega no `presence.state` que o cliente manda em
  // seguida. Assumir "ativo" faria a tela piscar cheio antes de apagar.
  const active = event.type === 'presence.state' ? event.active : false

  return { ...state, [event.sid]: { user: event.user, active } }
}

export function presentUsers(state: PresenceState, selfId: number) {
  const byUser = new Map<number, { user: PresenceUser; active: boolean }>()

  for (const { user, active } of Object.values(state)) {
    if (user.id === selfId) continue

    const seen = byUser.get(user.id)
    byUser.set(user.id, { user, active: active || (seen?.active ?? false) })
  }

  return [...byUser.values()].sort((a, b) => a.user.name.localeCompare(b.user.name, 'pt-BR'))
}
