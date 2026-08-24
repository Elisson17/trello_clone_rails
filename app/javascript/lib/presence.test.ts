import { EMPTY_PRESENCE, type PresenceState, presenceReducer, presentUsers } from './presence'

const ana = { id: 2, name: 'Ana', avatar_url: null }
const bia = { id: 3, name: 'Bia', avatar_url: null }

const reduce = (events: Parameters<typeof presenceReducer>[1][]) =>
  events.reduce(presenceReducer, EMPTY_PRESENCE)

describe('presenceReducer', () => {
  it('adds whoever joined, idle until they say otherwise', () => {
    const state = reduce([{ type: 'presence.join', sid: 'a', user: ana }])

    expect(state).toEqual({ a: { user: ana, active: false } })
  })

  it('takes the state a client announces', () => {
    const state = reduce([
      { type: 'presence.join', sid: 'a', user: ana },
      { type: 'presence.state', sid: 'a', user: ana, active: true },
    ])

    expect(state.a.active).toBe(true)
  })

  // Quem já estava lá quando eu cheguei nunca manda `join` para mim: só o `state` da chamada.
  it('accepts a state from a connection it never saw join', () => {
    const state = reduce([{ type: 'presence.state', sid: 'z', user: bia, active: true }])

    expect(state).toEqual({ z: { user: bia, active: true } })
  })

  it('drops whoever left', () => {
    const state = reduce([
      { type: 'presence.join', sid: 'a', user: ana },
      { type: 'presence.leave', sid: 'a' },
    ])

    expect(state).toEqual({})
  })

  it('ignores a leave it does not know', () => {
    expect(reduce([{ type: 'presence.leave', sid: 'ghost' }])).toEqual({})
  })
})

describe('presentUsers', () => {
  const twoTabs: PresenceState = {
    a: { user: ana, active: false },
    b: { user: ana, active: true },
  }

  it('shows one avatar per person, not per tab', () => {
    expect(presentUsers(twoTabs, 1)).toEqual([{ user: ana, active: true }])
  })

  it('counts the person as watching when any tab of theirs is in front', () => {
    expect(presentUsers(twoTabs, 1)[0].active).toBe(true)
  })

  it('leaves me out: I know I am here', () => {
    expect(presentUsers({ a: { user: ana, active: true } }, ana.id)).toEqual([])
  })

  it('orders by name, so the row does not shuffle on every event', () => {
    const state: PresenceState = {
      b: { user: bia, active: true },
      a: { user: ana, active: true },
    }

    expect(presentUsers(state, 1).map(({ user }) => user.name)).toEqual(['Ana', 'Bia'])
  })
})
