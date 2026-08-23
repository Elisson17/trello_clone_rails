import { router } from '@inertiajs/react'
import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type EditableTitleProps = {
  value: string
  url: string
  field?: string
  as?: 'h1' | 'h2' | 'h3' | 'span'
  className?: string
  readOnly?: boolean
}

export function EditableTitle({
  value,
  url,
  field = 'title',
  as: Tag = 'h2',
  className,
  readOnly,
}: EditableTitleProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function save() {
    setEditing(false)
    const title = draft.trim()

    if (!title || title === value) {
      setDraft(value)
      return
    }

    router.patch(url, { [field]: title }, { preserveScroll: true, preserveState: true })
  }

  if (readOnly) return <Tag className={className}>{value}</Tag>

  if (editing) {
    return (
      <Input
        autoFocus
        aria-label={`Renomear ${value}`}
        className={cn('h-auto py-1', className)}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key === 'Enter') save()
          if (event.key === 'Escape') {
            setDraft(value)
            setEditing(false)
          }
        }}
      />
    )
  }

  return (
    <Tag>
      <button
        type="button"
        className={cn(
          'w-full truncate rounded-sm px-1 py-1 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          className,
        )}
        onClick={() => {
          setDraft(value)
          setEditing(true)
        }}
      >
        {value}
      </button>
    </Tag>
  )
}
