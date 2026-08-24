import {
  type Announcements,
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Head, Link, router } from '@inertiajs/react'
import {
  AlignLeftIcon,
  ArchiveIcon,
  ArrowLeftIcon,
  CheckSquareIcon,
  CircleCheckIcon,
  CircleDotIcon,
  ClockIcon,
  CopyIcon,
  EllipsisIcon,
  GripVerticalIcon,
  HistoryIcon,
  MessageSquareIcon,
  PaperclipIcon,
  UsersIcon,
} from 'lucide-react'
import { useState } from 'react'

import { ActivityFeed } from '@/components/ActivityFeed'
import { BoardFilters } from '@/components/BoardFilters'
import { BoardMembersDialog } from '@/components/BoardMembersDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { CardDrawer } from '@/components/card/CardDrawer'
import { LabelChips } from '@/components/card/LabelPicker'
import { EditableTitle } from '@/components/EditableTitle'
import { InlineAdd } from '@/components/InlineAdd'
import { MemberAvatars } from '@/components/MemberAvatars'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useBoardChannel } from '@/hooks/use-board-channel'
import { useOptimisticMove } from '@/hooks/use-optimistic-move'
import { useShortcut } from '@/hooks/use-shortcut'
import { accentStyle } from '@/lib/accent'
import {
  type BoardFilter,
  countCards,
  EMPTY_FILTER,
  filterLists,
  isFiltering,
} from '@/lib/board-filter'
import { indexOfCard, listOfCard, moveCard, moveList } from '@/lib/board-move'
import { BOARD_THEME } from '@/lib/board-theme'
import { cn } from '@/lib/utils'
import type {
  ActivityPayload,
  BoardPayload,
  CardDetail,
  CardPayload,
  FeedPage,
  ListPayload,
} from '@/types/inertia'

type Can = { update: boolean; destroy: boolean; archive: boolean; manage_members: boolean }

// Ids do dnd-kit são planos, então o prefixo diz de que tipo é o alvo.
// `cards:` é a área de soltar da coluna: sem ela, lista vazia não recebe card.
const cardId = (id: number) => `card:${id}`
const listId = (id: number) => `list:${id}`
const dropId = (id: number) => `cards:${id}`

// Os listeners do dnd-kit chegam tipados como `Function`; o handle e a coluna precisam
// deles com a assinatura de evento do React.
type DragListeners = {
  onPointerDown?: React.PointerEventHandler
  onKeyDown?: React.KeyboardEventHandler
}

// O atalho `n` precisa de um alvo estável no DOM, e o botão de adicionar já existe.
const ADD_CARD_ID = 'board-add-card'

const parseId = (raw: string) => ({ kind: raw.split(':')[0], id: Number(raw.split(':')[1]) })

// Em que coluna está o alvo sob o cursor, seja ele um card, a coluna ou a área vazia dela.
function containerOf(lists: ListPayload[], raw: string) {
  const { kind, id } = parseId(raw)

  return kind === 'card' ? listOfCard(lists, id)?.id : id
}

// Assinatura da ordem atual: serve só para não mandar request quando nada mudou de lugar.
const orderOf = (lists: ListPayload[]) =>
  lists.map((list) => `${list.id}:${list.cards.map((card) => card.id)}`).join('|')

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function BoardShow({
  board,
  can,
  card,
  activities,
}: {
  board: BoardPayload
  can: Can
  // Presente só na rota `/cards/:id`: é o modal do card sobre este mesmo board.
  card?: CardDetail
  // Em `/cards/:id` é o feed do card; em `/boards/:id/activities`, o do board.
  activities?: FeedPage<ActivityPayload>
}) {
  const theme = BOARD_THEME[board.background]
  const { lists, setDraft, moveCard: commitCard, moveList: commitList } = useOptimisticMove(board)

  useBoardChannel(board.id)
  const [dragging, setDragging] = useState<string | null>(null)
  const [filter, setFilter] = useState<BoardFilter>(EMPTY_FILTER)

  // Com filtro ligado o arrasto sai: índice dentro de coluna filtrada não é a posição real.
  const filtering = isFiltering(filter)
  const visibleLists = filterLists(lists, filter)
  const canDrag = can.update && !filtering

  // `n` abre o formulário de card da primeira coluna, o mesmo botão que o mouse clica.
  useShortcut('n', () => document.getElementById(ADD_CARD_ID)?.click())

  const sensors = useSensors(
    // 5px de folga: sem isso o clique no botão de concluir vira um drag de zero pixel.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragStart({ active }: DragStartEvent) {
    setDragging(String(active.id))
  }

  // Atravessar colunas é resolvido durante o arrasto para o buraco abrir na coluna de
  // destino enquanto o card ainda está no ar.
  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const { kind, id } = parseId(String(active.id))
    if (kind !== 'card') return

    const target = containerOf(lists, String(over.id))
    const origin = listOfCard(lists, id)
    if (target === undefined || !origin || origin.id === target) return

    setDraft(moveCard(lists, id, target, dropIndex(lists, target, String(over.id))))
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setDragging(null)
    if (!over) return setDraft(null)

    const { kind, id } = parseId(String(active.id))
    const target = containerOf(lists, String(over.id))
    if (target === undefined) return

    if (kind === 'list') {
      const index = lists.findIndex((list) => list.id === target)
      return commit(moveList(lists, id, index), () => commitList(lists, id, index))
    }

    const index = dropIndex(lists, target, String(over.id))
    commit(moveCard(lists, id, target, index), (next) => commitCard(next, id, target, index))
  }

  function commit(next: ListPayload[], request: (next: ListPayload[]) => void) {
    if (orderOf(next) === orderOf(board.lists)) return setDraft(null)

    request(next)
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <Head title={board.title} />

      <header className="border-b px-4 py-2.5">
        <div className="mx-auto flex max-w-full flex-wrap items-center gap-2">
          <Link
            href={`/workspaces/${board.workspace.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            {board.workspace.name}
          </Link>

          <span className="text-xs text-muted-foreground/50">/</span>

          <span aria-hidden className={cn('size-2.5 shrink-0 rounded-full', theme.rail)} />

          <EditableTitle
            as="h1"
            value={board.title}
            url={`/boards/${board.id}`}
            readOnly={!can.update}
            className="text-sm font-semibold tracking-tight"
          />

          <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">
            {board.cards_count}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {can.manage_members ? (
              <BoardMembersDialog board={board}>
                <button
                  type="button"
                  className="rounded-full transition-opacity hover:opacity-80"
                  aria-label="Membros do board"
                >
                  <MemberAvatars
                    users={board.members.slice(0, 4).map((member) => member.user)}
                    total={board.members.length}
                  />
                </button>
              </BoardMembersDialog>
            ) : (
              <MemberAvatars
                users={board.members.slice(0, 4).map((member) => member.user)}
                total={board.members.length}
              />
            )}

            <Button asChild variant="ghost" size="icon">
              <Link href={`/boards/${board.id}/activities`} aria-label="Atividade do board">
                <HistoryIcon />
              </Link>
            </Button>

            {can.archive && <BoardMenu board={board} can={can} />}
          </div>
        </div>
      </header>

      {board.lists.length > 0 && (
        <BoardFilters
          board={board}
          filter={filter}
          onChange={setFilter}
          visible={countCards(visibleLists)}
          total={countCards(lists)}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        accessibility={{ announcements: ANNOUNCEMENTS, screenReaderInstructions: INSTRUCTIONS }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setDragging(null)
          setDraft(null)
        }}
      >
        {/* Rolagem horizontal fica só nas colunas; a página nunca rola de lado. */}
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex h-full items-start gap-3">
            <SortableContext
              items={visibleLists.map((list) => listId(list.id))}
              strategy={horizontalListSortingStrategy}
            >
              {visibleLists.map((list, index) => (
                <ListColumn
                  key={list.id}
                  board={board}
                  list={list}
                  canWrite={can.update}
                  canDrag={canDrag}
                  addCardId={index === 0 ? ADD_CARD_ID : undefined}
                />
              ))}
            </SortableContext>

            {can.update && (
              <InlineAdd
                label="Adicionar lista"
                placeholder="Nome da lista"
                url={`/boards/${board.id}/lists`}
                className="w-72 shrink-0 rounded-xl border border-dashed p-2"
              />
            )}

            {lists.length === 0 && !can.update && (
              <p className="text-sm text-muted-foreground">Este board ainda não tem listas.</p>
            )}
          </div>
        </div>

        <DragOverlay modifiers={[restrictToWindowEdges]}>
          <DragPreview dragging={dragging} lists={lists} />
        </DragOverlay>
      </DndContext>

      {card && (
        <CardDrawer
          key={card.id}
          board={board}
          card={card}
          canWrite={can.update}
          activities={activities}
        />
      )}

      {activities && !card && <ActivitySheet board={board} feed={activities} />}
    </div>
  )
}

/** O feed do board também é rota (`/boards/:id/activities`), não estado de front. */
function ActivitySheet({ board, feed }: { board: BoardPayload; feed: FeedPage<ActivityPayload> }) {
  return (
    <Sheet
      open
      onOpenChange={(open) =>
        !open && router.get(`/boards/${board.id}`, {}, { preserveScroll: true })
      }
    >
      <SheetContent aria-describedby={undefined} className="md:max-w-md">
        <header className="border-b px-6 pt-5 pb-4">
          <SheetTitle className="text-base">Atividade</SheetTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Toda mutação deste board, da mais recente para a mais antiga.
          </p>
        </header>

        <div className="px-6 py-4">
          <ActivityFeed feed={feed} baseUrl={`/boards/${board.id}/activities`} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Índice de destino dentro da coluna: sobre um card, entra no lugar dele; sobre a coluna
// (ou sobre o vazio dela), vai para o fim.
function dropIndex(lists: ListPayload[], targetListId: number, overRaw: string) {
  const target = lists.find((list) => list.id === targetListId)
  if (!target) return 0

  const { kind, id } = parseId(overRaw)
  const index = kind === 'card' ? indexOfCard(target, id) : -1

  return index === -1 ? target.cards.length : index
}

function DragPreview({ dragging, lists }: { dragging: string | null; lists: ListPayload[] }) {
  if (!dragging) return null
  const { kind, id } = parseId(dragging)

  if (kind === 'list') {
    const list = lists.find((item) => item.id === id)

    return list ? (
      <div className="w-80 rounded-md border bg-card px-3 py-2.5 text-[13px] font-semibold shadow-lg">
        {list.title}
      </div>
    ) : null
  }

  const card = listOfCard(lists, id)?.cards.find((item) => item.id === id)

  return card ? (
    <div className="w-76 rotate-1 shadow-lg">
      <CardTile card={card} canWrite={false} />
    </div>
  ) : null
}

function BoardMenu({ board, can }: { board: BoardPayload; can: Can }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Ações do board">
          <EllipsisIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <BoardMembersDialog board={board}>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            <UsersIcon />
            Membros
          </DropdownMenuItem>
        </BoardMembersDialog>

        <DropdownMenuItem asChild>
          <Link href={`/boards/${board.id}/archived`}>
            <ArchiveIcon />
            Arquivados
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => router.post(`/boards/${board.id}/duplicate`)}>
          <CopyIcon />
          Duplicar board
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => router.post(`/boards/${board.id}/archive`)}>
          <ArchiveIcon />
          Arquivar board
        </DropdownMenuItem>

        {can.destroy && (
          <ConfirmDialog
            title={`Excluir ${board.title}?`}
            description="As listas e os cards deste board são apagados. Não dá para desfazer — arquivar guarda tudo."
            confirmLabel="Excluir board"
            destructive
            onConfirm={() => router.delete(`/boards/${board.id}`)}
          >
            <DropdownMenuItem variant="destructive" onSelect={(event) => event.preventDefault()}>
              Excluir board
            </DropdownMenuItem>
          </ConfirmDialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Transição curta, só para dar a leitura de onde o card saiu e para onde foi.
// Nada disso para quem pediu menos movimento.
const sortableTransition = () =>
  prefersReducedMotion() ? null : { duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }

function ListColumn({
  board,
  list,
  canWrite,
  canDrag,
  addCardId,
}: {
  board: BoardPayload
  list: ListPayload
  canWrite: boolean
  canDrag: boolean
  addCardId?: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: listId(list.id),
    disabled: !canDrag,
    transition: sortableTransition(),
    data: { label: `a lista ${list.title}` },
  })
  const drag = listeners as DragListeners | undefined

  const { setNodeRef: setDropRef } = useDroppable({
    id: dropId(list.id),
    data: { label: `a lista ${list.title}` },
  })

  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition: transition ?? undefined }}
      className={cn(
        'flex max-h-full w-80 shrink-0 flex-col rounded-md border bg-muted/40',
        isDragging && 'opacity-40',
      )}
    >
      <header className="flex items-center gap-1.5 px-3 py-2.5" onPointerDown={drag?.onPointerDown}>
        {canDrag && (
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            onKeyDown={drag?.onKeyDown}
            aria-label={`Mover a lista ${list.title}`}
            className="cursor-grab rounded text-muted-foreground/50 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <GripVerticalIcon className="size-3.5" />
          </button>
        )}

        {/* Bolinha de status da coluna. A cor sai do próprio nome da lista pelo
            `accentStyle` — a mesma derivação que os workspaces já usavam, sem coluna
            nova no banco só para guardar uma cor. */}
        <span
          aria-hidden
          style={accentStyle(list.title)}
          className="size-2.5 shrink-0 rounded-full bg-[var(--accent-solid)]"
        />

        <EditableTitle
          value={list.title}
          url={`/boards/${board.id}/lists/${list.id}`}
          readOnly={!canWrite}
          className="text-[13px] font-semibold"
        />

        <span className="shrink-0 rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">
          {list.cards.length}
        </span>

        {canWrite && (
          <ConfirmDialog
            title={`Arquivar ${list.title}?`}
            description="A lista e os cards dela sumem do board, mas continuam guardados."
            confirmLabel="Arquivar"
            onConfirm={() => router.delete(`/boards/${board.id}/lists/${list.id}`)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto size-7 text-muted-foreground hover:text-foreground"
              aria-label={`Arquivar ${list.title}`}
            >
              <ArchiveIcon className="size-3.5" />
            </Button>
          </ConfirmDialog>
        )}
      </header>

      <SortableContext
        items={list.cards.map((card) => cardId(card.id))}
        strategy={verticalListSortingStrategy}
      >
        {/* `min-h` dá alvo de soltura para a coluna vazia. */}
        <ul ref={setDropRef} className="flex min-h-12 flex-col gap-2 overflow-y-auto px-2 pb-2">
          {list.cards.map((card) => (
            <SortableCard key={card.id} card={card} canWrite={canWrite} canDrag={canDrag} />
          ))}
        </ul>
      </SortableContext>

      {canWrite && (
        <InlineAdd
          id={addCardId}
          label="Adicionar card"
          placeholder="Título do card"
          url="/cards"
          payload={{ list_id: list.id }}
          className="px-2 pb-2"
        />
      )}
    </section>
  )
}

function SortableCard({
  card,
  canWrite,
  canDrag,
}: {
  card: CardPayload
  canWrite: boolean
  canDrag: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: cardId(card.id),
    disabled: !canDrag,
    transition: sortableTransition(),
    data: { label: `o card ${card.title}` },
  })
  const drag = listeners as DragListeners | undefined

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition: transition ?? undefined }}
      className={cn(isDragging && 'opacity-40')}
      onPointerDown={drag?.onPointerDown}
    >
      <CardTile
        card={card}
        canWrite={canWrite}
        handle={
          canDrag ? (
            <button
              type="button"
              ref={setActivatorNodeRef}
              {...attributes}
              onKeyDown={drag?.onKeyDown}
              aria-label={`Mover o card ${card.title}`}
              className="mt-0.5 shrink-0 cursor-grab rounded text-muted-foreground/40 opacity-0 transition-opacity focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring group-hover:opacity-100"
            >
              <GripVerticalIcon className="size-3.5" />
            </button>
          ) : null
        }
      />
    </li>
  )
}

function CardTile({
  card,
  canWrite,
  handle,
}: {
  card: CardPayload
  canWrite: boolean
  handle?: React.ReactNode
}) {
  const completionUrl = `/cards/${card.id}/completion`
  const StateIcon = card.completed ? CircleCheckIcon : CircleDotIcon

  return (
    <article className="group overflow-hidden rounded-md border bg-card transition-colors hover:border-ring/60">
      {/* Capa como faixa fina: um bloco de 28px roubava a atenção do título. */}
      {card.cover_color && (
        <div aria-hidden className={cn('h-1 w-full', BOARD_THEME[card.cover_color].rail)} />
      )}

      <div className="px-3 py-2.5">
        {/* Linha de meta, como o `repo #123` de uma issue: o ícone de estado é o botão de
            concluir, então marcar não precisa de um segundo controle. */}
        <div className="flex items-center gap-1.5">
          {handle}

          {canWrite ? (
            <button
              type="button"
              aria-label={card.completed ? `Reabrir ${card.title}` : `Concluir ${card.title}`}
              aria-pressed={card.completed}
              className={cn(
                'shrink-0 rounded-full transition-colors',
                card.completed ? 'text-done' : 'text-open hover:text-foreground',
              )}
              onClick={() =>
                card.completed
                  ? router.delete(completionUrl, { preserveScroll: true })
                  : router.post(completionUrl, {}, { preserveScroll: true })
              }
            >
              <StateIcon className="size-3.5" />
            </button>
          ) : (
            <StateIcon
              aria-hidden
              className={cn('size-3.5 shrink-0', card.completed ? 'text-done' : 'text-open')}
            />
          )}

          <span className="text-xs text-muted-foreground">#{card.id}</span>

          {card.assignees.length > 0 && (
            <MemberAvatars
              users={card.assignees.slice(0, 3)}
              total={card.assignees.length}
              className="ml-auto scale-75 origin-right"
            />
          )}

          {canWrite && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Arquivar ${card.title}`}
              className={cn(
                'size-6 shrink-0 text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100',
                card.assignees.length === 0 && 'ml-auto',
              )}
              onClick={() => router.post(`/cards/${card.id}/archive`, {}, { preserveScroll: true })}
            >
              <ArchiveIcon className="size-3" />
            </Button>
          )}
        </div>

        {/* O painel é a rota `/cards/:id`, então isto é link de verdade: abre em outra
            aba, aparece na barra de status e volta no back. */}
        <Link
          href={`/cards/${card.id}`}
          className={cn(
            'mt-0.5 block rounded-sm text-[13px] leading-snug focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            card.completed && 'text-muted-foreground line-through',
          )}
        >
          {card.title}
        </Link>

        <CardBadges card={card} />
      </div>
    </article>
  )
}

// A linha de baixo do tile: o que existe dentro do card sem precisar abri-lo.
function CardBadges({ card }: { card: CardPayload }) {
  const meta = [
    card.has_description && { key: 'description', icon: AlignLeftIcon, text: null },
    card.checklist && {
      key: 'checklist',
      icon: CheckSquareIcon,
      text: `${card.checklist.done}/${card.checklist.total}`,
    },
    card.comments_count > 0 && {
      key: 'comments',
      icon: MessageSquareIcon,
      text: String(card.comments_count),
    },
    card.attachments_count > 0 && {
      key: 'attachments',
      icon: PaperclipIcon,
      text: String(card.attachments_count),
    },
  ].filter(Boolean) as { key: string; icon: typeof AlignLeftIcon; text: string | null }[]

  if (!card.due_at && meta.length === 0 && card.labels.length === 0) return null

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <LabelChips labels={card.labels} />

      {card.due_at && (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] font-medium',
            card.overdue
              ? 'border-destructive/40 bg-destructive/15 text-destructive'
              : 'border-transparent bg-muted text-muted-foreground',
          )}
        >
          <ClockIcon className="size-3" />
          {new Date(card.due_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
      )}

      {meta.map(({ key, icon: Icon, text }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 text-[11px] tabular-nums text-muted-foreground"
        >
          <Icon className="size-3" />
          {text}
        </span>
      ))}
    </div>
  )
}

// O leitor de tela é a única pista de posição para quem move pelo teclado.
const INSTRUCTIONS = {
  draggable:
    'Aperte espaço para pegar. Use as setas para mover, espaço para soltar e escape para cancelar.',
}

const label = (item: { data: { current?: Record<string, unknown> } } | null) =>
  (item?.data.current?.label as string | undefined) ?? 'o item'

const ANNOUNCEMENTS: Announcements = {
  onDragStart: ({ active }) => `Pegou ${label(active)}.`,
  onDragOver: ({ active, over }) =>
    over ? `${label(active)} está sobre ${label(over)}.` : `${label(active)} está fora do board.`,
  onDragEnd: ({ active, over }) =>
    over ? `Soltou ${label(active)} em ${label(over)}.` : `Soltou fora: ${label(active)} voltou.`,
  onDragCancel: ({ active }) => `Movimento cancelado, ${label(active)} voltou ao lugar.`,
}
