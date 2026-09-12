import { describe, expect, it } from 'vitest'

import { TURNSTILE_TEST_SITE_KEY, resolveTurnstileSiteKey } from './turnstile'

describe('resolveTurnstileSiteKey', () => {
  it('falls back to the test key when no env value is set', () => {
    expect(resolveTurnstileSiteKey(undefined)).toBe(TURNSTILE_TEST_SITE_KEY)
  })

  it('falls back to the test key when the env value is blank', () => {
    expect(resolveTurnstileSiteKey('   ')).toBe(TURNSTILE_TEST_SITE_KEY)
  })

  it('uses a configured site key when present', () => {
    expect(resolveTurnstileSiteKey('0x4AAAAAABNNDl3iXET1e-P9')).toBe('0x4AAAAAABNNDl3iXET1e-P9')
  })

  it('trims surrounding whitespace from a configured site key', () => {
    expect(resolveTurnstileSiteKey('  0xabc123  ')).toBe('0xabc123')
  })
})
