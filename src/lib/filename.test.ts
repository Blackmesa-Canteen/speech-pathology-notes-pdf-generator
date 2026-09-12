import { describe, expect, it } from 'vitest'

import { buildSessionNotesFilename } from './filename'

describe('buildSessionNotesFilename', () => {
  it('builds a filename from surname, first name, and date', () => {
    const filename = buildSessionNotesFilename({
      childFirstName: 'Ava',
      childSurname: 'Smith',
      sessionDate: new Date(2026, 8, 15), // 15 Sep 2026, local time
    })
    expect(filename).toBe('SessionNotes_Smith_Ava_2026-09-15.pdf')
  })

  it('strips whitespace from multi-word names', () => {
    const filename = buildSessionNotesFilename({
      childFirstName: 'Mary Jane',
      childSurname: 'Van Dyke',
      sessionDate: new Date(2026, 0, 1),
    })
    expect(filename).toBe('SessionNotes_VanDyke_MaryJane_2026-01-01.pdf')
  })

  it('uses the local calendar date, not a UTC-shifted one', () => {
    // Late-evening local time near a UTC day boundary — a naive
    // toISOString().slice(0, 10) would roll this over to the next day
    // in timezones ahead of UTC.
    const lateEvening = new Date(2026, 8, 15, 23, 30)
    const filename = buildSessionNotesFilename({
      childFirstName: 'Ava',
      childSurname: 'Smith',
      sessionDate: lateEvening,
    })
    expect(filename).toContain('2026-09-15')
  })
})
