import { describe, expect, it } from 'vitest'

import { sessionNotesSchema } from './sessionNotesSchema'

const validData = {
  childFirstName: 'Ava',
  childSurname: 'Smith',
  sessionDate: new Date('2026-09-15'),
  startTime: '09:30',
  finishTime: '10:15',
  presentParticipants: ['Mother'],
  typeOfVisit: 'Therapy session',
  sessionGoals: 'Improve /s/ sounds.',
  notes: '',
  betweenVisitsPlan: '',
  nextVisitPlan: '',
  nextVisitTime: '',
  signatureDataUrl: 'data:image/png;base64,abc',
  clinicianEmail: 'jane@example.com',
}

describe('sessionNotesSchema', () => {
  it('accepts a fully valid submission', () => {
    expect(sessionNotesSchema.safeParse(validData).success).toBe(true)
  })

  it('accepts optional fields left blank', () => {
    const result = sessionNotesSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it.each([
    'childFirstName',
    'childSurname',
    'startTime',
    'finishTime',
    'typeOfVisit',
    'sessionGoals',
    'signatureDataUrl',
  ])('rejects a blank required field: %s', (field) => {
    const result = sessionNotesSchema.safeParse({ ...validData, [field]: '' })
    expect(result.success).toBe(false)
  })

  it('requires a session date', () => {
    const { sessionDate: _sessionDate, ...rest } = validData
    const result = sessionNotesSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('requires at least one present participant', () => {
    const result = sessionNotesSchema.safeParse({ ...validData, presentParticipants: [] })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid clinician email', () => {
    const result = sessionNotesSchema.safeParse({ ...validData, clinicianEmail: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects notes longer than the max length', () => {
    const result = sessionNotesSchema.safeParse({ ...validData, notes: 'a'.repeat(10_001) })
    expect(result.success).toBe(false)
  })

  it('accepts notes right at the max length', () => {
    const result = sessionNotesSchema.safeParse({ ...validData, notes: 'a'.repeat(10_000) })
    expect(result.success).toBe(true)
  })
})
