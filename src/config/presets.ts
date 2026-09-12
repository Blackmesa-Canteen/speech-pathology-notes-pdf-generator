import presetsRaw from '@/config/presets.json'
import { presetsSchema } from '@/config/presetsSchema'

/**
 * Validated at module load so a bad edit to presets.json fails loudly here
 * instead of silently rendering a broken dropdown.
 */
export const presets = presetsSchema.parse(presetsRaw)
