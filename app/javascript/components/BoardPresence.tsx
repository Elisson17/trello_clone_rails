import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { PresenceUser } from '@/lib/presence'
import { cn } from '@/lib/utils'

const LIMIT = 5

export function BoardPresence({ people }: { people: { user: PresenceUser; active: boolean }[] }) {
  if (people.length === 0) return null

  const shown = people.slice(0, LIMIT)
  const overflow = people.length - shown.length

  return (
    <div className="flex -space-x-2">
      {shown.map(({ user, active }) => (
        <Avatar
          key={user.id}
          role="img"
          aria-label={`${user.name}, ${active ? 'vendo agora' : 'em outra aba'}`}
          className={cn(
            'presence-enter size-7 ring-2 transition-opacity duration-200',
            active ? 'ring-primary' : 'opacity-45 ring-card',
          )}
        >
          <AvatarImage src={user.avatar_url ?? undefined} alt="" />
          <AvatarFallback className="text-[11px]">{user.name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      ))}

      {overflow > 0 && (
        <span className="flex size-7 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground ring-2 ring-card">
          +{overflow}
        </span>
      )}
    </div>
  )
}
