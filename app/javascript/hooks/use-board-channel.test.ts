import { renderHook } from '@testing-library/react'

import { useBoardChannel } from './use-board-channel'

const router = vi.hoisted(() => ({ reload: vi.fn() }))
const cable = vi.hoisted(() => ({
  received: (_event: { type: string; by: number | null }) => {},
  unsubscribe: vi.fn(),
  disconnect: vi.fn(),
}))

vi.mock('@inertiajs/react', () => ({
  router,
  usePage: () => ({ props: { auth: { user: { id: 7 } } } }),
}))

vi.mock('@rails/actioncable', () => ({
  createConsumer: () => ({
    subscriptions: {
      create: (_params: unknown, handlers: { received: typeof cable.received }) => {
        cable.received = handlers.received
        return { unsubscribe: cable.unsubscribe }
      },
    },
    disconnect: cable.disconnect,
  }),
}))

describe('useBoardChannel', () => {
  beforeEach(() => router.reload.mockClear())

  it('asks Inertia for the board again when someone else changes it', () => {
    renderHook(() => useBoardChannel(42))

    cable.received({ type: 'board.updated', by: 99 })

    expect(router.reload).toHaveBeenCalledWith({
      only: ['board', 'unread_notifications_count'],
    })
  })

  it('ignores the event it caused itself', () => {
    renderHook(() => useBoardChannel(42))

    cable.received({ type: 'board.updated', by: 7 })

    expect(router.reload).not.toHaveBeenCalled()
  })

  it('unsubscribes when the board leaves the screen', () => {
    renderHook(() => useBoardChannel(42)).unmount()

    expect(cable.unsubscribe).toHaveBeenCalled()
  })
})
