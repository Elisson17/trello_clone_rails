import { Link } from '@inertiajs/react'
import { ChevronsUpDownIcon, LogOutIcon, MoonIcon, SunIcon, UserIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/hooks/use-theme'
import type { SharedUser } from '@/types/inertia'

/** Rodapé da sidebar: quem está logado, e tudo que é da conta atrás de um clique. */
export function UserMenu({ user }: { user: SharedUser }) {
  const { resolved, setTheme } = useTheme()
  const next = resolved === 'dark' ? 'light' : 'dark'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto w-full justify-start gap-2 px-2 py-1.5">
          <Avatar className="size-6">
            <AvatarImage src={user.avatar_url ?? undefined} alt="" />
            <AvatarFallback>{user.name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="min-w-0 truncate text-sm font-medium">{user.name}</span>
          <ChevronsUpDownIcon className="ml-auto size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      {/* Abre para cima: o gatilho é a última coisa da coluna. */}
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuLabel>
          <span className="block font-semibold">{user.name}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon />
            Perfil
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => setTheme(next)}>
          {resolved === 'dark' ? <SunIcon /> : <MoonIcon />}
          Tema {next === 'dark' ? 'escuro' : 'claro'}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/users/sign_out" method="delete" as="button" className="w-full">
            <LogOutIcon />
            Sair
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
