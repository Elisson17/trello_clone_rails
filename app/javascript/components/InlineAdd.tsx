import { useForm } from '@inertiajs/react'
import { PlusIcon } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type InlineAddProps = {
  label: string
  placeholder: string
  url: string
  payload?: Record<string, string | number>
  className?: string
}

export function InlineAdd({ label, placeholder, url, payload, className }: InlineAddProps) {
  const [open, setOpen] = useState(false)
  const field = useRef<HTMLInputElement>(null)
  const form = useForm<{ title: string }>({ title: '' })

  function submit() {
    if (!form.data.title.trim()) return

    // `transform` devolve void neste release do adapter: não dá para encadear com `.post`.
    form.transform((data) => ({ ...data, ...payload }))
    form.post(url, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        form.reset()
        field.current?.focus()
      },
    })
  }

  if (!open) {
    return (
      <Button
        variant="ghost"
        className={cn('w-full justify-start text-muted-foreground', className)}
        onClick={() => setOpen(true)}
      >
        <PlusIcon />
        {label}
      </Button>
    )
  }

  return (
    <form
      className={cn('flex flex-col gap-2', className)}
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <Input
        ref={field}
        autoFocus
        aria-label={label}
        placeholder={placeholder}
        value={form.data.title}
        aria-invalid={!!form.errors.title || undefined}
        onChange={(event) => form.setData('title', event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            form.reset()
            setOpen(false)
          }
        }}
      />

      {form.errors.title && (
        <span className="text-[12.5px] font-medium text-destructive">{form.errors.title}</span>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={form.processing}>
          Adicionar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            form.reset()
            setOpen(false)
          }}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
