import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** O Inertia manda array de mensagens quando o modelo tem mais de um erro no campo. */
export type FieldError = string | string[]

type FieldProps = {
  label?: string
  error?: FieldError
  hint?: ReactNode
  required?: boolean
  className?: string
  children: ReactNode
}

/**
 * Anatomia label/campo/erro do design system. Input e Select vestem esta casca,
 * então todo formulário do app erra e acerta do mesmo jeito.
 */
export function Field({ label, error, hint, required, className, children }: FieldProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: o controle vem via children (Input/Select) e fica dentro do label
    <label className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <span className="text-[13px] font-semibold text-foreground">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </span>
      )}

      {children}

      {error ? (
        <span className="text-[12.5px] font-medium text-destructive">
          {Array.isArray(error) ? error.join(', ') : error}
        </span>
      ) : (
        hint && <span className="text-[12.5px] text-muted-foreground">{hint}</span>
      )}
    </label>
  )
}
