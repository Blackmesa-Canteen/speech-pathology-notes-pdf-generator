import { describe, expect, it } from 'vitest'

import { buildPdfMetadataKeywords, parsePdfMetadataKeywords } from './pdfMetadata'
import type { SessionNotesFormValues } from '@/schemas/sessionNotesSchema'

const validData: SessionNotesFormValues = {
  childFirstName: 'Ava',
  childSurname: 'Smith',
  sessionDate: new Date('2026-09-15'),
  startTime: '09:30',
  finishTime: '10:15',
  presentParticipants: [{ role: 'Mother', name: 'Jane Smith' }],
  typeOfVisit: 'Therapy session',
  sessionGoals: 'Improve /s/ sounds.',
  notes: 'Some notes.',
  betweenVisitsPlan: '',
  nextVisitPlan: '',
  nextVisitTime: '',
  signatureDataUrl: 'data:image/png;base64,abc',
  clinicianEmail: 'jane@example.com',
}

describe('buildPdfMetadataKeywords / parsePdfMetadataKeywords', () => {
  it('round-trips valid form data, including dates', () => {
    const keywords = buildPdfMetadataKeywords(validData)
    const result = parsePdfMetadataKeywords(keywords)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.childFirstName).toBe('Ava')
      expect(result.data.sessionDate).toEqual(validData.sessionDate)
      expect(result.data.presentParticipants).toEqual([{ role: 'Mother', name: 'Jane Smith' }])
    }
  })

  it('round-trips an optional nextVisitDate', () => {
    const withNextVisit = { ...validData, nextVisitDate: new Date('2026-09-29') }
    const result = parsePdfMetadataKeywords(buildPdfMetadataKeywords(withNextVisit))

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.nextVisitDate).toEqual(withNextVisit.nextVisitDate)
  })

  it('rejects undefined keywords (not our PDF)', () => {
    const result = parsePdfMetadataKeywords(undefined)
    expect(result).toEqual({ ok: false, reason: 'missing' })
  })

  it('rejects malformed JSON', () => {
    const result = parsePdfMetadataKeywords('{not valid json')
    expect(result).toEqual({ ok: false, reason: 'corrupt' })
  })

  it('rejects keywords from a different app', () => {
    const result = parsePdfMetadataKeywords(JSON.stringify({ app: 'some-other-app', version: 1, data: {} }))
    expect(result).toEqual({ ok: false, reason: 'wrong-app' })
  })

  it('rejects an unsupported version', () => {
    const result = parsePdfMetadataKeywords(
      JSON.stringify({ app: 'speech-pathology-notes-pdf-generator', version: 999, data: {} }),
    )
    expect(result).toEqual({ ok: false, reason: 'unsupported-version' })
  })

  it('rejects a well-formed envelope whose data fails schema validation', () => {
    const result = parsePdfMetadataKeywords(
      JSON.stringify({
        app: 'speech-pathology-notes-pdf-generator',
        version: 2,
        data: { childFirstName: '' }, // missing everything else required
      }),
    )
    expect(result).toEqual({ ok: false, reason: 'invalid-data' })
  })
})
