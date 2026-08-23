import { router } from '@inertiajs/react'
import { UserMinusIcon } from 'lucide-react'
import { useState } from 'react'

import { Select } from '@/components/Select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { BoardMember, BoardPayload } from '@/types/inertia'

const BOARD_ROLES: Record<BoardMember['role'], string> = {
  admin: 'Admin',
  member: 'Membro',
  viewer: 'Leitor',
}

export function BoardMembersDialog({
  board,
  children,
}: {
  board: BoardPayload
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const inBoard = new Set(board.members.map((member) => member.user.id))
  const candidates = board.workspace_members.filter((user) => !inBoard.has(user.id))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Membros de {board.title}</DialogTitle>
          <DialogDescription>
            Quem está aqui vê o board e pode ser responsável por um card. Só membros do workspace
            entram — de fora, o caminho é o convite.
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-2">
          {board.members.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              <Avatar size="sm">
                <AvatarImage src={member.user.avatar_url ?? undefined} alt="" />
                <AvatarFallback className="text-[11px]">
                  {member.user.name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{member.user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
              </div>

              <Select
                aria-label={`Papel de ${member.user.name}`}
                className="h-8 w-28"
                value={member.role}
                onChange={(event) =>
                  router.patch(
                    `/boards/${board.id}/memberships/${member.id}`,
                    { role: event.target.value },
                    { preserveScroll: true },
                  )
                }
              >
                {Object.entries(BOARD_ROLES).map(([role, label]) => (
                  <option key={role} value={role}>
                    {label}
                  </option>
                ))}
              </Select>

              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                aria-label={`Remover ${member.user.name} do board`}
                onClick={() =>
                  router.delete(`/boards/${board.id}/memberships/${member.id}`, {
                    preserveScroll: true,
                  })
                }
              >
                <UserMinusIcon className="size-4" />
              </Button>
            </li>
          ))}
        </ul>

        {candidates.length > 0 && (
          <div className="flex flex-col gap-2 border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground">Do workspace, fora do board</p>

            {candidates.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar size="sm">
                  <AvatarImage src={user.avatar_url ?? undefined} alt="" />
                  <AvatarFallback className="text-[11px]">
                    {user.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <span className="min-w-0 flex-1 truncate text-sm">{user.name}</span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    router.post(
                      `/boards/${board.id}/memberships`,
                      { user_id: user.id },
                      { preserveScroll: true },
                    )
                  }
                >
                  Adicionar
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
