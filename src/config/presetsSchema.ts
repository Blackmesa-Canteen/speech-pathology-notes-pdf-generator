import { z } from 'zod'

export const presetsSchema = z.object({
  presentParticipants: z.array(z.string().min(1)),
  typeOfVisit: z.array(z.string().min(1)),
})

export type Presets = z.infer<typeof presetsSchema>
