import { renderHook } from '@testing-library/react'

import { useShortcut } from './use-shortcut'

const press = (key: string, options: KeyboardEventInit & { target?: Element } = {}) => {
  const { target, ...init } = options
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  ;(target ?? document.body).dispatchEvent(event)

  return event
}

describe('useShortcut', () => {
  it('runs the handler on the key it watches', () => {
    const handler = vi.fn()
    renderHook(() => useShortcut('n', handler))

    press('n')

    expect(handler).toHaveBeenCalledOnce()
  })

  it('ignores any other key', () => {
    const handler = vi.fn()
    renderHook(() => useShortcut('n', handler))

    press('m')

    expect(handler).not.toHaveBeenCalled()
  })

  it('leaves the key to the browser when a modifier is held', () => {
    const handler = vi.fn()
    renderHook(() => useShortcut('n', handler))

    press('n', { metaKey: true })

    expect(handler).not.toHaveBeenCalled()
  })

  it('does not steal the key from someone typing', () => {
    const handler = vi.fn()
    const input = document.body.appendChild(document.createElement('input'))
    renderHook(() => useShortcut('n', handler))

    press('n', { target: input })

    expect(handler).not.toHaveBeenCalled()
  })

  it('prevents the default of the key it handles', () => {
    renderHook(() => useShortcut('/', () => {}))

    expect(press('/').defaultPrevented).toBe(true)
  })

  it('stops listening after unmount', () => {
    const handler = vi.fn()
    renderHook(() => useShortcut('n', handler)).unmount()

    press('n')

    expect(handler).not.toHaveBeenCalled()
  })
})
