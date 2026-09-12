import { deserializeDates, serializeDates } from '@/lib/sessionNotesSerialization'
import type { SessionNotesFormValues } from '@/schemas/sessionNotesSchema'

const DRAFT_KEY = 'speech-pathology-notes-pdf-generator:draft'

export function saveDraft(values: Partial<SessionNotesFormValues>) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(serializeDates(values)))
  } catch {
    // localStorage may be unavailable (private browsing, quota) — draft
    // autosave is a nice-to-have, never block the user over it.
  }
}

export function loadDraft(): Partial<SessionNotesFormValues> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return deserializeDates(JSON.parse(raw))
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
