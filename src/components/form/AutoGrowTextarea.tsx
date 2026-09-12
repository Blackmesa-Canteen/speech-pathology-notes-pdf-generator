import * as React from 'react'

import { Textarea } from '@/components/ui/textarea'

type AutoGrowTextareaProps = React.ComponentProps<'textarea'>

/**
 * Grows with content via scrollHeight rather than CSS field-sizing, since
 * field-sizing: content isn't supported in every browser a user might have.
 */
export const AutoGrowTextarea = React.forwardRef<HTMLTextAreaElement, AutoGrowTextareaProps>(
  function AutoGrowTextarea({ onInput, value, ...props }, forwardedRef) {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null)

    const resize = React.useCallback((el: HTMLTextAreaElement | null) => {
      if (!el) return
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [])

    React.useEffect(() => {
      resize(innerRef.current)
    }, [resize, value])

    return (
      <Textarea
        ref={(el) => {
          innerRef.current = el
          if (typeof forwardedRef === 'function') forwardedRef(el)
          else if (forwardedRef) forwardedRef.current = el
        }}
        value={value}
        onInput={(e) => {
          resize(e.currentTarget)
          onInput?.(e)
        }}
        className="overflow-hidden"
        {...props}
      />
    )
  },
)
