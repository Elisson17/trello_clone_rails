import type * as React from 'react'
import { Dialog as SheetPrimitive } from 'radix-ui'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Painel ancorado numa borda, no lugar do diálogo centralizado. É o mesmo primitivo de
 * diálogo do Radix (foco preso, `esc`, overlay); mudam a ancoragem e a animação.
 * Dois lados, não quatro: `right` é o painel do card e `left` é a gaveta de navegação.
 * Topo e base não têm uso nenhum no app.
 */
function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

const SIDES = {
  right:
    'inset-y-0 right-0 max-w-[52rem] border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
  left: 'inset-y-0 left-0 max-w-[20rem] border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
}

function SheetContent({
  className,
  children,
  side = 'right',
  closeLabel = 'Fechar',
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: keyof typeof SIDES
  closeLabel?: string
}) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-black/40 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 duration-150 ease-out-strong data-[state=closed]:duration-100"
      />

      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'fixed z-50 flex w-full flex-col overflow-y-auto bg-background shadow-2xl outline-none',
          'duration-200 ease-out-strong data-[state=closed]:animate-out data-[state=closed]:duration-150 data-[state=open]:animate-in',
          SIDES[side],
          className,
        )}
        {...props}
      >
        {children}

        <SheetPrimitive.Close
          className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={closeLabel}
        >
          <XIcon className="size-4" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

const SheetTitle = SheetPrimitive.Title
const SheetDescription = SheetPrimitive.Description

export { Sheet, SheetContent, SheetDescription, SheetTitle }
