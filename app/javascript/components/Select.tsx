import { type ReactNode, useId } from 'react'

import { Field, type FieldError } from '@/components/Field'
import {
  SelectContent,
  SelectItem,
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type SelectOption = {
  value: string
  label: ReactNode
}

type SelectProps = {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  label?: string
  error?: FieldError
  hint?: ReactNode
  placeholder?: string
  required?: boolean
  disabled?: boolean
  name?: string
  size?: 'sm' | 'default'
  className?: string
  fieldClassName?: string
  'aria-label'?: string
}

export function Select({
  options,
  value,
  onChange,
  label,
  error,
  hint,
  placeholder,
  required,
  disabled,
  name,
  size,
  className,
  fieldClassName,
  'aria-label': ariaLabel,
}: SelectProps) {
  const labelId = useId()
  const triggerId = useId()

  return (
    <Field
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={fieldClassName}
      labelId={label ? labelId : undefined}
    >
      <SelectRoot
        value={value}
        onValueChange={onChange}
        required={required}
        disabled={disabled}
        name={name}
      >
        <SelectTrigger
          id={triggerId}
          size={size}
          className={cn('w-full', className)}
          aria-label={ariaLabel}
          aria-labelledby={label ? `${labelId} ${triggerId}` : undefined}
          aria-invalid={!!error || undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {/* `popper` ancora a lista abaixo do gatilho; o `item-aligned` do shadcn cobre o
            campo com a opção escolhida, como o select do macOS. */}
        <SelectContent position="popper" align="start" sideOffset={4}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </Field>
  )
}
