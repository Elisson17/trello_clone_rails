import { router, usePage } from '@inertiajs/react'
import { SearchIcon } from 'lucide-react'
import { useRef, useState } from 'react'

import { Input } from '@/components/ui/input'
import { useShortcut } from '@/hooks/use-shortcut'

/**
 * Busca global, no topo da sidebar. O resultado é uma página (`/search?q=`) e não um
 * popover: assim o link é compartilhável, o back funciona e não existe estado de busca
 * no cliente.
 */
export function GlobalSearch() {
  const { term } = usePage<{ term?: string }>().props
  const field = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(term ?? '')

  useShortcut('/', () => field.current?.focus())

  return (
    <search className="relative block w-full">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (value.trim()) router.get('/search', { q: value.trim() })
        }}
      >
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-2.5 left-2.5 size-3.5 text-muted-foreground"
        />

        <Input
          ref={field}
          type="search"
          name="q"
          aria-label="Buscar boards e cards"
          placeholder="Buscar…  /"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="h-8 pl-7 text-sm"
        />
      </form>
    </search>
  )
}
