import { Check, Plus, X } from 'lucide-react'
import * as React from 'react'

import { PresetCombobox } from '@/components/form/PresetCombobox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Participant } from '@/schemas/sessionNotesSchema'

type ParticipantsFieldProps = {
  value: Participant[]
  onChange: (value: Participant[]) => void
  onBlur?: () => void
  roleOptions: string[]
  'aria-invalid'?: boolean
}

/**
 * Present participants as role+name pairs — e.g. "Jane Doe (Mother)" — added
 * via an inline role/name row instead of a single free-text tag.
 */
export function ParticipantsField({
  value,
  onChange,
  onBlur,
  roleOptions,
  ...rest
}: ParticipantsFieldProps) {
  const roleInputId = React.useId()
  const [adding, setAdding] = React.useState(false)
  const [role, setRole] = React.useState('')
  const [name, setName] = React.useState('')

  const cancelAdding = () => {
    setAdding(false)
    setRole('')
    setName('')
  }

  const confirmAdd = () => {
    if (!role.trim() || !name.trim()) return
    onChange([...value, { role: role.trim(), name: name.trim() }])
    cancelAdding()
  }

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div
      className={cn(
        'space-y-2 rounded-md border border-input p-2',
        rest['aria-invalid'] && 'border-destructive',
      )}
      onBlur={onBlur}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {value.map((participant, index) => (
          <Badge key={`${index}-${participant.role}-${participant.name}`} variant="secondary" className="gap-1">
            {participant.name} ({participant.role})
            <button
              type="button"
              aria-label={`Remove ${participant.name}`}
              className="rounded-full outline-none hover:text-destructive"
              onClick={() => removeAt(index)}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        {!adding && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => setAdding(true)}
            aria-label="Add participant"
          >
            <Plus className="size-4" />
          </Button>
        )}
      </div>

      {adding && (
        <div className="flex flex-wrap items-center gap-2">
          <PresetCombobox
            id={roleInputId}
            value={role}
            onChange={setRole}
            options={roleOptions}
            placeholder="Role, e.g. Speech Pathologist"
            aria-label="Participant role"
          />
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            aria-label="Participant name"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                confirmAdd()
              } else if (event.key === 'Escape') {
                cancelAdding()
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            className="size-7"
            disabled={!role.trim() || !name.trim()}
            onClick={confirmAdd}
            aria-label="Confirm add participant"
          >
            <Check className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={cancelAdding}
            aria-label="Cancel add participant"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
