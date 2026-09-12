import {
  deserializeDates,
  serializeDates,
  type SerializedSessionNotes,
} from '@/lib/sessionNotesSerialization'
import { type SessionNotesFormValues, sessionNotesSchema } from '@/schemas/sessionNotesSchema'

const APP_ID = 'speech-pathology-notes-pdf-generator'
const CURRENT_VERSION = 1

type PdfMetadataEnvelope = {
  app: string
  version: number
  data: unknown
}

/**
 * Builds the JSON string embedded in the generated PDF's Keywords field so
 * the exact form data can be read back out later (see ImportPdfButton).
 */
export function buildPdfMetadataKeywords(values: SessionNotesFormValues): string {
  const envelope: PdfMetadataEnvelope = {
    app: APP_ID,
    version: CURRENT_VERSION,
    data: serializeDates(values),
  }
  return JSON.stringify(envelope)
}

export type ParsePdfMetadataResult =
  | { ok: true; data: SessionNotesFormValues }
  | { ok: false; reason: 'missing' | 'corrupt' | 'wrong-app' | 'unsupported-version' | 'invalid-data' }

/**
 * Reverses buildPdfMetadataKeywords(). Never throws — every failure mode is
 * an expected "this isn't a PDF we generated" case, not a bug.
 */
export function parsePdfMetadataKeywords(keywords: string | undefined): ParsePdfMetadataResult {
  if (!keywords) return { ok: false, reason: 'missing' }

  let envelope: PdfMetadataEnvelope
  try {
    envelope = JSON.parse(keywords)
  } catch {
    return { ok: false, reason: 'corrupt' }
  }

  if (envelope?.app !== APP_ID) return { ok: false, reason: 'wrong-app' }
  if (envelope.version !== CURRENT_VERSION) return { ok: false, reason: 'unsupported-version' }

  const result = sessionNotesSchema.safeParse(deserializeDates(envelope.data as SerializedSessionNotes))
  if (!result.success) return { ok: false, reason: 'invalid-data' }

  return { ok: true, data: result.data }
}
