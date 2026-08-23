import { describe, expect, it } from 'vitest'

import { activityText } from '@/lib/activity-text'
import type { ActivityPayload } from '@/types/inertia'

const activity = (action: string, metadata: ActivityPayload['metadata'] = {}): ActivityPayload => ({
  id: 1,
  action,
  metadata,
  created_at: '2026-08-23T12:00:00Z',
  actor: { id: 1, name: 'Maria', avatar_url: null },
  url: null,
})

describe('activityText', () => {
  it('names the card that was created', () => {
    expect(activityText(activity('card.created', { title: 'Comprar café' }))).toBe(
      'criou o card «Comprar café»',
    )
  })

  it('drops the card title inside the card panel, where it is already the screen', () => {
    expect(activityText(activity('card.created', { title: 'Comprar café' }), true)).toBe(
      'criou o card',
    )
  })

  it('spells out which fields an update touched', () => {
    expect(
      activityText(activity('card.updated', { title: 'X', fields: ['description', 'due_at'] })),
    ).toBe('editou a descrição e o prazo de «X»')
  })

  it('falls back to the card itself when the update touched nothing it knows', () => {
    expect(activityText(activity('card.updated', { title: 'X', fields: ['position'] }))).toBe(
      'editou o card «X»',
    )
  })

  it('reads the move as a trip between two lists', () => {
    expect(activityText(activity('card.moved', { title: 'X', from: 'A fazer', to: 'Feito' }))).toBe(
      'moveu o card «X» de A fazer para Feito',
    )
  })

  it('translates the role of a new member', () => {
    expect(activityText(activity('member.added', { name: 'João', role: 'admin' }))).toBe(
      'adicionou João como administrador',
    )
  })

  it('writes the due date warning as a sentence of its own, because nobody signed it', () => {
    expect(activityText(activity('card.due_soon', { title: 'X' }))).toBe(
      'o prazo de «X» vence nas próximas 24 horas',
    )
  })

  it('shows the raw action when the front does not know it yet', () => {
    expect(activityText(activity('something.new'))).toBe('something.new')
  })
})
