import { Link, usePage } from '@inertiajs/react'
import { BellIcon, LayoutGridIcon, PlusIcon } from 'lucide-react'

import { GlobalSearch } from '@/components/GlobalSearch'
import { NewWorkspaceDialog } from '@/components/NewWorkspaceDialog'
import { UserMenu } from '@/components/UserMenu'
import { accentStyle } from '@/lib/accent'
import { cn } from '@/lib/utils'
import type { NavBoard, NavWorkspace, SharedUser } from '@/types/inertia'

const ITEM =
  'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sidebar-ring'

const ACTIVE = 'bg-sidebar-accent font-medium text-sidebar-foreground'

const GROUP = 'px-2 text-[11px] font-medium tracking-wider text-muted-foreground uppercase'

export function AppSidebar({
  user,
  nav,
}: {
  user: SharedUser
  nav: { workspaces: NavWorkspace[]; recent_boards: NavBoard[] }
}) {
  const { url } = usePage()

  // A home casa exata, porque `/` é prefixo de tudo. O resto casa por prefixo, para o
  // board aberto manter o workspace dele aceso na lateral.
  const isActive = (href: string) => (href === '/' ? url === '/' : url.startsWith(href))

  const item = (href: string, icon: React.ReactNode, label: string) => (
    <Link
      href={href}
      className={cn(ITEM, isActive(href) && ACTIVE)}
      aria-current={isActive(href) ? 'page' : undefined}
    >
      {icon}
      <span className="min-w-0 truncate">{label}</span>
    </Link>
  )

  return (
    <nav
      aria-label="Principal"
      className="flex h-full flex-col gap-4 overflow-y-auto bg-sidebar p-3 text-sidebar-foreground"
    >
      <Link
        href="/"
        className="rounded-sm px-2 font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
      >
        Trello Clone
      </Link>

      <GlobalSearch />

      <div className="flex flex-col gap-0.5">
        {item('/', <LayoutGridIcon className="size-4 shrink-0" />, 'Boards')}
        {item('/notifications', <BellIcon className="size-4 shrink-0" />, 'Notificações')}
      </div>

      <div className="flex flex-col gap-0.5">
        <h2 className={GROUP}>Workspaces</h2>

        {nav.workspaces.map((workspace) => {
          const href = `/workspaces/${workspace.slug}`

          return (
            <Link
              key={workspace.slug}
              href={href}
              className={cn(ITEM, isActive(href) && ACTIVE)}
              aria-current={isActive(href) ? 'page' : undefined}
            >
              {/* A cor do workspace já é derivada do slug em toda tela; aqui ela vira
                  âncora de navegação em vez de enfeite. */}
              <span
                aria-hidden
                style={accentStyle(workspace.slug)}
                className="size-2 shrink-0 rounded-full bg-[var(--accent-solid)]"
              />
              <span className="min-w-0 truncate">{workspace.name}</span>
            </Link>
          )
        })}

        <NewWorkspaceDialog
          trigger={
            <button type="button" className={cn(ITEM, 'w-full text-muted-foreground')}>
              <PlusIcon className="size-4 shrink-0" />
              <span>Novo workspace</span>
            </button>
          }
        />
      </div>

      {/* Some enquanto não há visita registrada: seção vazia permanente é ruído. */}
      {nav.recent_boards.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <h2 className={GROUP}>Recentes</h2>

          {nav.recent_boards.map((board) => (
            <Link
              key={board.id}
              href={`/boards/${board.id}`}
              className={cn(ITEM, isActive(`/boards/${board.id}`) && ACTIVE)}
            >
              <span aria-hidden className="size-2 shrink-0 rounded-[3px] bg-muted-foreground/50" />
              <span className="min-w-0 truncate">{board.title}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-auto border-t pt-2">
        <UserMenu user={user} />
      </div>
    </nav>
  )
}
