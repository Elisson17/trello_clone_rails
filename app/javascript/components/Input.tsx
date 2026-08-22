import type { ComponentProps, ReactNode } from 'react'

import { Field, type FieldError } from '@/components/Field'
import { Input as InputBase } from '@/components/ui/input'

type InputProps = ComponentProps<'input'> & {
  label?: string
  error?: FieldError
  hint?: ReactNode
  fieldClassName?: string
}

export function Input({ label, error, hint, fieldClassName, required, ...props }: InputProps) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={fieldClassName}>
      <InputBase required={required} aria-invalid={!!error || undefined} {...props} />
    </Field>
  )
}
