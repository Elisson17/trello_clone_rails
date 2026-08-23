import { Link } from '@inertiajs/react'
import { BellIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

/** Sino do header: contador e caminho para a central. Ler é a página, não um popover. */
export function NotificationBell({ count }: { count: number }) {
  return (
    <Button asChild variant="ghost" size="icon">
      <Link
        href="/notifications"
        className="relative"
        aria-label={count > 0 ? `Notificações (${count} não lidas)` : 'Notificações'}
      >
        <BellIcon />

        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 rounded-full bg-destructive px-1 text-[10px] leading-4 font-semibold text-white tabular-nums">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Link>
    </Button>
  )
}
