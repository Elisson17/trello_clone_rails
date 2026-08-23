import { router } from '@inertiajs/react'
import { Trash2Icon } from 'lucide-react'

import { EditableTitle } from '@/components/EditableTitle'
import { InlineAdd } from '@/components/InlineAdd'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ChecklistPayload } from '@/types/inertia'

export function CardChecklists({
  cardId,
  checklists,
  canWrite,
}: {
  cardId: number
  checklists: ChecklistPayload[]
  canWrite: boolean
}) {
  return (
    <div className="flex flex-col gap-5">
      {checklists.map((checklist) => (
        <Checklist key={checklist.id} cardId={cardId} checklist={checklist} canWrite={canWrite} />
      ))}

      {canWrite && (
        <InlineAdd
          label="Adicionar checklist"
          placeholder="Nome do checklist"
          url={`/cards/${cardId}/checklists`}
        />
      )}
    </div>
  )
}

function Checklist({
  cardId,
  checklist,
  canWrite,
}: {
  cardId: number
  checklist: ChecklistPayload
  canWrite: boolean
}) {
  // Sem item, a barra fica vazia em vez de dividir por zero.
  const percent = checklist.total === 0 ? 0 : Math.round((checklist.done / checklist.total) * 100)

  return (
    <section className="flex flex-col gap-2">
      <header className="flex items-center gap-2">
        <h4 className="flex-1 text-sm font-semibold">{checklist.title}</h4>
        <span className="text-xs tabular-nums text-muted-foreground">
          {checklist.done}/{checklist.total}
        </span>

        {canWrite && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            aria-label={`Excluir checklist ${checklist.title}`}
            onClick={() =>
              router.delete(`/cards/${cardId}/checklists/${checklist.id}`, { preserveScroll: true })
            }
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        )}
      </header>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso de ${checklist.title}`}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-(--ease-out-strong)"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="flex flex-col">
        {checklist.items.map((item) => (
          <li key={item.id} className="group/item flex items-center gap-2 py-0.5">
            <input
              type="checkbox"
              checked={item.completed}
              disabled={!canWrite}
              aria-label={item.content}
              className="size-4 shrink-0 accent-primary"
              onChange={(event) =>
                router.patch(
                  `/checklist_items/${item.id}`,
                  { completed: event.target.checked },
                  { preserveScroll: true },
                )
              }
            />

            <EditableTitle
              as="span"
              value={item.content}
              field="content"
              url={`/checklist_items/${item.id}`}
              readOnly={!canWrite}
              className={cn(
                'flex-1 text-sm font-normal',
                item.completed && 'line-through opacity-60',
              )}
            />

            {canWrite && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover/item:opacity-100"
                aria-label={`Excluir ${item.content}`}
                onClick={() =>
                  router.delete(`/checklist_items/${item.id}`, { preserveScroll: true })
                }
              >
                <Trash2Icon className="size-3" />
              </Button>
            )}
          </li>
        ))}
      </ul>

      {canWrite && (
        <InlineAdd
          label="Adicionar item"
          placeholder="O que falta?"
          url="/checklist_items"
          name="content"
          payload={{ checklist_id: checklist.id }}
        />
      )}
    </section>
  )
}
