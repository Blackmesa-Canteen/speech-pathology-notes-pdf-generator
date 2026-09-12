import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DatePickerFieldProps = {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  onBlur?: () => void
  placeholder?: string
  id?: string
  'aria-invalid'?: boolean
}

export function DatePickerField({
  value,
  onChange,
  onBlur,
  placeholder = 'Pick a date',
  id,
  ...rest
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) onBlur?.()
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn('w-full justify-start font-normal', !value && 'text-muted-foreground')}
          {...rest}
        >
          <CalendarIcon className="size-4" />
          {value ? format(value, 'd MMM yyyy') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date)
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
