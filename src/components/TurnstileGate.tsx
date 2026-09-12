import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getTurnstileSiteKey } from '@/lib/turnstile'

const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

type TurnstileRenderOptions = {
  sitekey: string
  callback: (token: string) => void
  'error-callback'?: () => void
  'expired-callback'?: () => void
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileRenderOptions) => string
      remove: (widgetId: string) => void
    }
  }
}

// Cached at module scope so remounting the gate (or React StrictMode's
// double-invoke in dev) doesn't inject the <script> tag more than once.
let scriptLoadPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (scriptLoadPromise) return scriptLoadPromise

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Turnstile script'))
    document.head.appendChild(script)
  })
  return scriptLoadPromise
}

type Status = 'loading' | 'ready' | 'verified' | 'error'

/**
 * Gates its children behind a Cloudflare Turnstile check. This is a purely
 * client-side check with no server-side token verification (this app has no
 * backend) — it deters casual scripted bots, but a determined attacker
 * controlling their own headless browser can bypass it. See README for the
 * honest caveat.
 */
export function TurnstileGate({ children }: { children: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = React.useState<Status>('loading')
  const [retryKey, setRetryKey] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false
    let widgetId: string | undefined

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: getTurnstileSiteKey(),
          callback: () => {
            if (!cancelled) setStatus('verified')
          },
          'error-callback': () => {
            if (!cancelled) setStatus('error')
          },
          'expired-callback': () => {
            if (!cancelled) setStatus('ready')
          },
        })
        if (!cancelled) setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      // In dev, React StrictMode double-invokes this effect; if the widget
      // already auto-resolved and Turnstile tore it down itself before this
      // cleanup ran, remove() harmlessly console.warns "widget not found" —
      // expected dev-only noise, not a bug, and it doesn't happen in prod
      // (StrictMode's double-invoke is a development-only behavior).
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId)
      }
    }
  }, [retryKey])

  if (status === 'verified') return <>{children}</>

  const handleRetry = () => {
    scriptLoadPromise = null
    setStatus('loading')
    setRetryKey((key) => key + 1)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Verify you&apos;re human</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {status === 'error'
              ? "Couldn't load the verification check — check your connection and try again."
              : 'Complete the check below to continue to the form.'}
          </p>
          <div ref={containerRef} />
          {status === 'error' && (
            <Button type="button" variant="outline" size="sm" onClick={handleRetry}>
              Try again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
