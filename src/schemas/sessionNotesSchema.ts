import { z } from 'zod'

const requiredText = (label: string) => z.string().trim().min(1, `${label} is required`)

const longText = (label: string, max = 10_000) =>
  z.string().trim().max(max, `${label} is too long (max ${max} characters)`)

export const participantSchema = z.object({
  role: requiredText('Role'),
  name: requiredText('Name'),
})

export type Participant = z.infer<typeof participantSchema>

export const sessionNotesSchema = z.object({
  childFirstName: requiredText("Child's first name"),
  childSurname: requiredText("Child's surname"),
  sessionDate: z.date({ required_error: 'Session date is required' }),
  startTime: requiredText('Start time'),
  finishTime: requiredText('Finish time'),
  presentParticipants: z.array(participantSchema).min(1, 'Add at least one participant'),
  typeOfVisit: requiredText('Type of visit'),
  sessionGoals: longText('Session goals').min(1, 'Session goals are required'),
  notes: longText('Notes'),
  betweenVisitsPlan: longText('Between-visits plan'),
  nextVisitPlan: longText('Next visit plan'),
  nextVisitDate: z.date().optional(),
  nextVisitTime: z.string().trim(),
  signatureDataUrl: requiredText('Signature'),
  clinicianEmail: z.string().trim().email('Enter a valid email address'),
})

export type SessionNotesFormValues = z.infer<typeof sessionNotesSchema>

export const sessionNotesDefaultValues: Partial<SessionNotesFormValues> = {
  childFirstName: '',
  childSurname: '',
  startTime: '',
  finishTime: '',
  presentParticipants: [],
  typeOfVisit: '',
  sessionGoals: '',
  notes: '',
  betweenVisitsPlan: '',
  nextVisitPlan: '',
  nextVisitTime: '',
  signatureDataUrl: '',
  clinicianEmail: '',
}
