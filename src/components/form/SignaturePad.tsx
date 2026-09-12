import * as React from 'react'
import SignatureCanvas from 'react-signature-canvas'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SignaturePadProps = {
  value: string
  onChange: (dataUrl: string) => void
  'aria-invalid'?: boolean
}

export function SignaturePad({ value, onChange, ...rest }: SignaturePadProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const padRef = React.useRef<SignatureCanvas | null>(null)

  const resizeCanvas = React.useCallback(() => {
    const container = containerRef.current
    const pad = padRef.current
    if (!container || !pad) return
    const canvas = pad.getCanvas()
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    const wasEmpty = pad.isEmpty()

    canvas.width = container.clientWidth * ratio
    canvas.height = container.clientHeight * ratio
    canvas.getContext('2d')?.scale(ratio, ratio)

    // Resizing clears the drawing surface; only wipe our stored value if the
    // pad was already empty, otherwise leave the last committed signature.
    if (wasEmpty) {
      pad.clear()
    }
  }, [])

  React.useEffect(() => {
    resizeCanvas()
    const observer = new ResizeObserver(resizeCanvas)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [resizeCanvas])

  const commit = () => {
    const pad = padRef.current
    if (!pad || pad.isEmpty()) {
      onChange('')
      return
    }
    // Not getTrimmedCanvas(): its trim-canvas dependency has a broken
    // CJS/ESM default-export interop under Vite that throws at runtime.
    // The untrimmed canvas is fine here — the PDF renders it with
    // objectFit: 'contain', so the extra transparent margin doesn't matter.
    onChange(pad.getCanvas().toDataURL('image/png'))
  }

  const handleClear = () => {
    padRef.current?.clear()
    onChange('')
  }

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className={cn(
          'h-40 w-full rounded-md border border-input bg-white',
          rest['aria-invalid'] && 'border-destructive',
        )}
      >
        <SignatureCanvas
          ref={padRef}
          penColor="black"
          canvasProps={{ className: 'h-full w-full' }}
          onEnd={commit}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {value ? 'Signature captured.' : 'Draw with mouse, finger, or stylus.'}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </div>
  )
}
