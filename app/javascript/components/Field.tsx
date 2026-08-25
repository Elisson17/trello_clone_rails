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
  /**
   * Id do texto do label, para o controle referenciar com `aria-labelledby`. Passe quando
   * o filho não for um controle nativo: `<label>` só rotula elementos labeláveis, e um
   * botão (o gatilho do Radix) envolvido por `<label>` recebe o clique duas vezes.
   */
  labelId?: string
  children: ReactNode
}

/**
 * Anatomia label/campo/erro do design system. Input e Select vestem esta casca,
 * então todo formulário do app erra e acerta do mesmo jeito.
 */
export function Field({ label, error, hint, required, className, labelId, children }: FieldProps) {
  const Wrapper = labelId ? 'div' : 'label'

  return (
    <Wrapper className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <span id={labelId} className="text-[13px] font-semibold text-foreground">
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
    </Wrapper>
  )
}
