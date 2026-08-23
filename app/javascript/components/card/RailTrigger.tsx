import type * as React from 'react'

import { cn } from '@/lib/utils'

/** A engrenagem que abre o editor de uma propriedade na trilha da direita. */
export function RailTrigger({
  label,
  className,
  children,
  ...props
}: React.ComponentProps<'button'> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'shrink-0 rounded-sm p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&_svg]:size-3.5',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
