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
  ArchiveIcon,
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  EllipsisIcon,
  GripVerticalIcon,
} from 'lucide-react'
import { useState } from 'react'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EditableTitle } from '@/components/EditableTitle'
import { InlineAdd } from '@/components/InlineAdd'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useOptimisticMove } from '@/hooks/use-optimistic-move'
import { indexOfCard, listOfCard, moveCard, moveList } from '@/lib/board-move'
import { BOARD_THEME } from '@/lib/board-theme'
import { cn } from '@/lib/utils'
import type { BoardPayload, CardPayload, ListPayload } from '@/types/inertia'

type Can = { update: boolean; destroy: boolean; archive: boolean }

// Ids do dnd-kit são planos, então o prefixo é o que diz de que tipo é o alvo.
// `cards:` é a área de soltar da coluna — sem ela, lista vazia não recebe card.
const cardId = (id: number) => `card:${id}`
const listId = (id: number) => `list:${id}`
const dropId = (id: number) => `cards:${id}`

// Os listeners do dnd-kit chegam tipados como `Function`; o handle e a coluna precisam
// deles com a assinatura de evento do React.
type DragListeners = {
  onPointerDown?: React.PointerEventHandler
  onKeyDown?: React.KeyboardEventHandler
}

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

export default function BoardShow({ board, can }: { board: BoardPayload; can: Can }) {
  const theme = BOARD_THEME[board.background]
  const { lists, setDraft, moveCard: commitCard, moveList: commitList } = useOptimisticMove(board)
  const [dragging, setDragging] = useState<string | null>(null)

  const sensors = useSensors(
    // 5px de folga: sem isso o clique no botão de concluir vira um drag de zero pixel.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragStart({ active }: DragStartEvent) {
    setDragging(String(active.id))
  }

  // Atravessar colunas é resolvido durante o arrasto, não na soltura: é isso que faz o
  // buraco abrir na coluna de destino enquanto o card ainda está no ar.
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

      <header className="border-b px-4 py-4">
        <div className="mx-auto flex max-w-full flex-wrap items-center gap-3">
          <Link
            href={`/workspaces/${board.workspace.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            {board.workspace.name}
          </Link>

          <span aria-hidden className={cn('h-5 w-1 rounded-full', theme.rail)} />

          <EditableTitle
            as="h1"
            value={board.title}
            url={`/boards/${board.id}`}
            readOnly={!can.update}
            className="text-lg font-semibold tracking-tight"
          />

          <span className="text-xs text-muted-foreground">
            {board.cards_count === 1 ? '1 card' : `${board.cards_count} cards`}
          </span>

          <div className="ml-auto">{can.archive && <BoardMenu board={board} can={can} />}</div>
        </div>
      </header>

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
        {/* Rolagem horizontal fica só nas colunas — a página em si nunca rola de lado. */}
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex h-full items-start gap-3">
            <SortableContext
              items={lists.map((list) => listId(list.id))}
              strategy={horizontalListSortingStrategy}
            >
              {lists.map((list) => (
                <ListColumn key={list.id} board={board} list={list} canWrite={can.update} />
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
    </div>
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
      <div className="w-72 rounded-xl border bg-card px-2 py-2 text-sm font-semibold shadow-lg">
        {list.title}
      </div>
    ) : null
  }

  const card = listOfCard(lists, id)?.cards.find((item) => item.id === id)

  return card ? (
    <div className="w-68 rotate-2 shadow-lg">
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

// Transição curta e com curva forte: o objetivo é consistência espacial (ver de onde o
// card saiu e para onde foi), não enfeite. Sem movimento para quem pediu menos movimento.
const sortableTransition = () =>
  prefersReducedMotion() ? null : { duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }

function ListColumn({
  board,
  list,
  canWrite,
}: {
  board: BoardPayload
  list: ListPayload
  canWrite: boolean
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
    disabled: !canWrite,
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
        'flex max-h-full w-72 shrink-0 flex-col rounded-xl border bg-card',
        isDragging && 'opacity-40',
      )}
    >
      <header
        className="flex items-center gap-1 border-b px-2 py-2"
        onPointerDown={drag?.onPointerDown}
      >
        {canWrite && (
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

        <EditableTitle
          value={list.title}
          url={`/boards/${board.id}/lists/${list.id}`}
          readOnly={!canWrite}
          className="flex-1 text-sm font-semibold"
        />
        <span className="px-1 text-xs tabular-nums text-muted-foreground">{list.cards.length}</span>

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
              className="size-7 text-muted-foreground hover:text-foreground"
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
        <ul ref={setDropRef} className="flex min-h-12 flex-col gap-2 overflow-y-auto p-2">
          {list.cards.map((card) => (
            <SortableCard key={card.id} card={card} canWrite={canWrite} />
          ))}
        </ul>
      </SortableContext>

      {canWrite && (
        <InlineAdd
          label="Adicionar card"
          placeholder="Título do card"
          url="/cards"
          payload={{ list_id: list.id }}
          className="p-2 pt-0"
        />
      )}
    </section>
  )
}

function SortableCard({ card, canWrite }: { card: CardPayload; canWrite: boolean }) {
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
    disabled: !canWrite,
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
          canWrite ? (
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

  return (
    <article
      className={cn(
        'group rounded-lg border bg-background p-2.5 transition-colors hover:border-foreground/20',
        card.completed && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-2">
        {handle}

        {canWrite && (
          <button
            type="button"
            aria-label={card.completed ? `Reabrir ${card.title}` : `Concluir ${card.title}`}
            aria-pressed={card.completed}
            className={cn(
              'mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border transition-colors',
              card.completed
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'border-input hover:border-foreground',
            )}
            onClick={() =>
              card.completed
                ? router.delete(completionUrl, { preserveScroll: true })
                : router.post(completionUrl, {}, { preserveScroll: true })
            }
          >
            {card.completed && <CheckIcon className="size-2.5" />}
          </button>
        )}

        <span className={cn('flex-1 text-sm', card.completed && 'line-through')}>{card.title}</span>

        {canWrite && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Arquivar ${card.title}`}
            className="size-6 shrink-0 text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
            onClick={() => router.post(`/cards/${card.id}/archive`, {}, { preserveScroll: true })}
          >
            <ArchiveIcon className="size-3" />
          </Button>
        )}
      </div>

      {card.due_at && (
        <span
          className={cn(
            'mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
            card.overdue ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground',
          )}
        >
          <ClockIcon className="size-3" />
          {new Date(card.due_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
      )}
    </article>
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
