import { describe, expect, it } from 'vitest'

import { presets } from './presets'

describe('presets config', () => {
  it('loads and validates presets.json', () => {
    expect(Array.isArray(presets.presentParticipants)).toBe(true)
    expect(Array.isArray(presets.typeOfVisit)).toBe(true)
  })

  it('has no blank or duplicate entries', () => {
    for (const list of [presets.presentParticipants, presets.typeOfVisit]) {
      expect(list.every((entry) => entry.trim().length > 0)).toBe(true)
      expect(new Set(list).size).toBe(list.length)
    }
  })
})
