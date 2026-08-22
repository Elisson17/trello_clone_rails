import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export type AvatarUser = { id: number; name: string; avatar_url: string | null }

export function MemberAvatars({
  users,
  total,
  className,
}: {
  users: AvatarUser[]
  total: number
  className?: string
}) {
  const overflow = total - users.length

  return (
    <div className={cn('flex -space-x-2', className)}>
      {users.map((user) => (
        <Avatar key={user.id} className="size-7 ring-2 ring-card" title={user.name}>
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
