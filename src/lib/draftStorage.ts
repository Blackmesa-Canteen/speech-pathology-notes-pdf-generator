import type { SessionNotesFormValues } from '@/schemas/sessionNotesSchema'

const DRAFT_KEY = 'speech-pathology-notes:draft'

type SerializedDraft = Omit<Partial<SessionNotesFormValues>, 'sessionDate' | 'nextVisitDate'> & {
  sessionDate?: string
  nextVisitDate?: string
}

export function saveDraft(values: Partial<SessionNotesFormValues>) {
  try {
    const serialized: SerializedDraft = {
      ...values,
      sessionDate: values.sessionDate?.toISOString(),
      nextVisitDate: values.nextVisitDate?.toISOString(),
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(serialized))
  } catch {
    // localStorage may be unavailable (private browsing, quota) — draft
    // autosave is a nice-to-have, never block the user over it.
  }
}

export function loadDraft(): Partial<SessionNotesFormValues> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SerializedDraft
    return {
      ...parsed,
      sessionDate: parsed.sessionDate ? new Date(parsed.sessionDate) : undefined,
      nextVisitDate: parsed.nextVisitDate ? new Date(parsed.nextVisitDate) : undefined,
    }
  } catch {
    return null
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // ignore
  }
}
