import { router } from '@inertiajs/react'
import { CheckIcon, SettingsIcon } from 'lucide-react'
import { RailTrigger } from '@/components/card/RailTrigger'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { BoardMember } from '@/types/inertia'

export function AssigneePicker({
  cardId,
  members,
  selected,
}: {
  cardId: number
  members: BoardMember[]
  selected: number[]
}) {
  function toggle(userId: number) {
    // O `:id` da rota é o do usuário — do lado do front existe um alvo só, a pessoa.
    if (selected.includes(userId)) {
      return router.delete(`/cards/${cardId}/assignments/${userId}`, { preserveScroll: true })
    }

    router.post(`/cards/${cardId}/assignments`, { user_id: userId }, { preserveScroll: true })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <RailTrigger label="Escolher responsáveis">
          <SettingsIcon />
        </RailTrigger>
      </PopoverTrigger>

      <PopoverContent align="end">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Membros do board</p>

        <ul className="flex flex-col gap-1">
          {members.map(({ user }) => (
            <li key={user.id}>
              <button
                type="button"
                aria-pressed={selected.includes(user.id)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
                onClick={() => toggle(user.id)}
              >
                <Avatar size="sm">
                  <AvatarImage src={user.avatar_url ?? undefined} alt="" />
                  <AvatarFallback className="text-[11px]">
                    {user.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <span className="min-w-0 flex-1 truncate">{user.name}</span>
                {selected.includes(user.id) && <CheckIcon className="size-3.5" />}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
