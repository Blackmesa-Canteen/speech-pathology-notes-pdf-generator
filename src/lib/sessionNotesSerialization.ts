import type { SessionNotesFormValues } from '@/schemas/sessionNotesSchema'

export type SerializedSessionNotes = Omit<
  Partial<SessionNotesFormValues>,
  'sessionDate' | 'nextVisitDate'
> & {
  sessionDate?: string
  nextVisitDate?: string
}

/** Converts sessionDate/nextVisitDate to ISO strings so the result is JSON-safe. */
export function serializeDates(values: Partial<SessionNotesFormValues>): SerializedSessionNotes {
  return {
    ...values,
    sessionDate: values.sessionDate?.toISOString(),
    nextVisitDate: values.nextVisitDate?.toISOString(),
  }
}

/** Reverses serializeDates(), turning ISO strings back into Date objects. */
export function deserializeDates(values: SerializedSessionNotes): Partial<SessionNotesFormValues> {
  return {
    ...values,
    sessionDate: values.sessionDate ? new Date(values.sessionDate) : undefined,
    nextVisitDate: values.nextVisitDate ? new Date(values.nextVisitDate) : undefined,
  }
}
