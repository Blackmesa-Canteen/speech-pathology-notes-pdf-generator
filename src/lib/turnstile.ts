/**
 * Cloudflare's official "always passes, visible" Turnstile test key. Safe to
 * use as the default everywhere a real site key isn't configured (local dev,
 * CI/e2e, PR previews on hostnames the real widget isn't registered for) —
 * unlike a real site key, it isn't restricted to a specific hostname.
 * See: https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 */
export const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA'

/** Pure so it's trivial to unit test without mocking import.meta.env. */
export function resolveTurnstileSiteKey(envValue: string | undefined): string {
  return envValue?.trim() || TURNSTILE_TEST_SITE_KEY
}

export function getTurnstileSiteKey(): string {
  return resolveTurnstileSiteKey(import.meta.env.VITE_TURNSTILE_SITE_KEY)
}
