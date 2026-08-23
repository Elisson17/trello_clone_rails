import { describe, expect, it } from 'vitest'

import { humanSize, toLocalInput } from '@/lib/card-format'

describe('humanSize', () => {
  it('writes small files in kilobytes', () => {
    expect(humanSize(2048)).toContain('kB')
  })

  it('switches to megabytes past the boundary', () => {
    expect(humanSize(3 * 1024 * 1024)).toContain('MB')
  })
})

describe('toLocalInput', () => {
  it('returns an empty string when there is no date', () => {
    expect(toLocalInput(null)).toBe('')
  })

  it('formats a date as the datetime-local input expects', () => {
    expect(toLocalInput('2026-08-22T15:30:00Z')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })
})
