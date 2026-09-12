import { X } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

function useFilteredOptions(query: string, options: string[]) {
  return React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((option) => option.toLowerCase().includes(q))
  }, [query, options])
}

type PresetComboboxProps = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  options: string[]
  placeholder?: string
  id?: string
  'aria-invalid'?: boolean
}

/**
 * A single-value combobox: pick a preset from the list, or type any free
 * text — free text commits directly as the field value, it is never
 * rejected for not matching a preset.
 */
export function PresetCombobox({
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  id,
  ...rest
}: PresetComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const filtered = useFilteredOptions(value, options)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => {
            onChange(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={onBlur}
          {...rest}
        />
      </PopoverAnchor>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] min-w-72 p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            {filtered.length === 0 ? (
              <CommandEmpty>No presets match — your typed text will be used.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filtered.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      onChange(option)
                      setOpen(false)
                    }}
                  >
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

type PresetTagInputProps = {
  value: string[]
  onChange: (value: string[]) => void
  onBlur?: () => void
  options: string[]
  placeholder?: string
  id?: string
  'aria-invalid'?: boolean
}

/**
 * A multi-value tag input: pick presets from the list, or type free text
 * and press Enter/comma to add it as a tag — never restricted to presets.
 */
export function PresetTagInput({
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  id,
  ...rest
}: PresetTagInputProps) {
  const [query, setQuery] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const remainingOptions = React.useMemo(
    () => options.filter((option) => !value.includes(option)),
    [options, value],
  )
  const filtered = useFilteredOptions(query, remainingOptions)

  const commit = (raw: string) => {
    const tag = raw.trim()
    if (!tag || value.includes(tag)) return
    onChange([...value, tag])
    setQuery('')
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((v) => v !== tag))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          className={cn(
            'flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 text-sm shadow-xs',
            'focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30',
          )}
        >
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                className="rounded-full outline-none hover:text-destructive"
                onClick={() => removeTag(tag)}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <input
            id={id}
            className="min-w-24 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            value={query}
            placeholder={value.length === 0 ? placeholder : undefined}
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault()
                commit(query)
              } else if (event.key === 'Backspace' && query === '' && value.length > 0) {
                removeTag(value[value.length - 1])
              }
            }}
            onBlur={() => {
              commit(query)
              onBlur?.()
            }}
            {...rest}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] min-w-72 p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            {filtered.length === 0 ? (
              <CommandEmpty>No presets match — press Enter to add "{query.trim()}".</CommandEmpty>
            ) : (
              <CommandGroup>
                {filtered.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      commit(option)
                      setOpen(false)
                    }}
                  >
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
