import { format } from 'date-fns'

import type { SessionNotesFormValues } from '@/schemas/sessionNotesSchema'

export function buildSessionNotesFilename(
  values: Pick<SessionNotesFormValues, 'childFirstName' | 'childSurname' | 'sessionDate'>,
) {
  // format(), not toISOString(): the latter converts to UTC first, which
  // can shift the displayed calendar date by a day depending on the
  // user's timezone.
  const datePart = format(values.sessionDate, 'yyyy-MM-dd')
  const namePart = `${values.childSurname}_${values.childFirstName}`.replace(/\s+/g, '')
  return `SessionNotes_${namePart}_${datePart}.pdf`
}
