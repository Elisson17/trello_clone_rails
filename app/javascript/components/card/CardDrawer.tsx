import { router } from '@inertiajs/react'
import { ArchiveIcon, CircleCheckIcon, CircleDotIcon, ClockIcon } from 'lucide-react'
import { ActivityFeed } from '@/components/ActivityFeed'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { AssigneePicker } from '@/components/card/AssigneePicker'
import { CardAttachments } from '@/components/card/CardAttachments'
import { CardChecklists } from '@/components/card/CardChecklists'
import { CardComments } from '@/components/card/CardComments'
import { CardDescription } from '@/components/card/CardDescription'
import { CoverPicker } from '@/components/card/CoverPicker'
import { LabelChips, LabelPicker } from '@/components/card/LabelPicker'
import { EditableTitle } from '@/components/EditableTitle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { BOARD_THEME } from '@/lib/board-theme'
import { relativeTime, toLocalInput } from '@/lib/card-format'
import { cn } from '@/lib/utils'
import type { ActivityPayload, BoardPayload, CardDetail, FeedPage } from '@/types/inertia'

export function CardDrawer({
  board,
  card,
  canWrite,
  activities,
}: {
  board: BoardPayload
  card: CardDetail
  canWrite: boolean
  activities?: FeedPage<ActivityPayload>
}) {
  const labels = board.labels.filter((label) => card.label_ids.includes(label.id))
  const assignees = board.members.filter((member) => card.assignee_ids.includes(member.user.id))

  // Fechar é voltar para a página do board: o painel é uma rota, não um estado local.
  const close = () => router.get(`/boards/${board.id}`, {}, { preserveScroll: true })

  const patch = (attributes: Record<string, string | null>) =>
    router.patch(`/cards/${card.id}`, attributes, { preserveScroll: true })

  return (
    <Sheet open onOpenChange={(open) => !open && close()}>
      <SheetContent aria-describedby={undefined}>
        <header className="sticky top-0 z-10 border-b bg-background px-6 pt-5 pb-4">
          {/* O título acessível do painel é o texto; o campo editável fica ao lado dele
              porque `EditableTitle` troca de elemento ao entrar em edição. */}
          <SheetTitle className="sr-only">{card.title}</SheetTitle>

          <div className="flex items-start gap-1.5 pr-10">
            <EditableTitle
              as="h2"
              value={card.title}
              url={`/cards/${card.id}`}
              readOnly={!canWrite}
              className="text-xl leading-tight font-semibold tracking-tight"
            />
            <span className="mt-0.5 shrink-0 text-xl font-normal text-muted-foreground">
              #{card.id}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <StatePill completed={card.completed} />

            <SheetDescription className="text-xs">
              <span className="font-medium text-foreground">{card.creator.name}</span> abriu este
              card {relativeTime(card.created_at)} · na lista{' '}
              <span className="font-medium text-foreground">{card.list.title}</span>
            </SheetDescription>
          </div>
        </header>

        <div className="grid flex-1 items-start gap-0 md:grid-cols-[1fr_17rem]">
          <div className="flex min-w-0 flex-col gap-6 px-6 py-5">
            <Section title="Descrição">
              <CardDescription
                cardId={card.id}
                description={card.description}
                canWrite={canWrite}
              />
            </Section>

            <Section title="Tarefas">
              <CardChecklists cardId={card.id} checklists={card.checklists} canWrite={canWrite} />
            </Section>

            <Section title="Anexos">
              <CardAttachments
                cardId={card.id}
                attachments={card.attachments}
                canWrite={canWrite}
              />
            </Section>

            {activities && (
              <Section title="Atividade">
                <ActivityFeed feed={activities} baseUrl={`/cards/${card.id}`} bare />
              </Section>
            )}

            <Section title={`Comentários (${card.comments.length})`}>
              <CardComments
                cardId={card.id}
                comments={card.comments}
                canWrite={canWrite}
                footer={canWrite ? <CompletionButton card={card} /> : null}
              />
            </Section>
          </div>

          {/* Trilha de propriedades, como a coluna da direita de uma issue: rótulo
              pequeno, valor embaixo, e a engrenagem abre quem edita. */}
          <aside className="flex flex-col border-t bg-muted/25 px-5 py-2 md:border-t-0 md:border-l">
            <RailRow
              label="Responsáveis"
              action={
                canWrite && (
                  <AssigneePicker
                    cardId={card.id}
                    members={board.members}
                    selected={card.assignee_ids}
                  />
                )
              }
            >
              {assignees.length === 0 ? (
                <Empty>Ninguém ainda</Empty>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {assignees.map(({ user }) => (
                    <li key={user.id} className="flex items-center gap-2">
                      <Avatar size="sm" className="size-5">
                        <AvatarImage src={user.avatar_url ?? undefined} alt="" />
                        <AvatarFallback className="text-[10px]">
                          {user.name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-xs font-medium">{user.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </RailRow>

            <RailRow
              label="Etiquetas"
              action={
                canWrite && <LabelPicker board={board} cardId={card.id} selected={card.label_ids} />
              }
            >
              {labels.length === 0 ? <Empty>Sem etiqueta</Empty> : <LabelChips labels={labels} />}
            </RailRow>

            <RailRow label="Prazo">
              <Input
                id={`card-due-${card.id}`}
                type="datetime-local"
                aria-label="Prazo"
                className="h-7 text-xs"
                disabled={!canWrite}
                value={toLocalInput(card.due_at)}
                // O input fala no fuso do navegador; o servidor guarda em UTC.
                onChange={(event) =>
                  patch({
                    due_at: event.target.value ? new Date(event.target.value).toISOString() : '',
                  })
                }
              />

              {card.overdue && (
                <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-destructive">
                  <ClockIcon className="size-3" />
                  Prazo vencido
                </span>
              )}
            </RailRow>

            <RailRow
              label="Capa"
              action={
                canWrite && (
                  <CoverPicker
                    cover={card.cover_color}
                    onPick={(color) => patch({ cover_color: color })}
                  />
                )
              }
            >
              {card.cover_color ? (
                <span
                  aria-hidden
                  className={cn('block h-4 w-full rounded-sm', BOARD_THEME[card.cover_color].rail)}
                />
              ) : (
                <Empty>Sem capa</Empty>
              )}
            </RailRow>

            {canWrite && (
              <div className="flex flex-col items-start gap-1 py-3">
                <RailAction onClick={() => router.post(`/cards/${card.id}/archive`)}>
                  <ArchiveIcon className="size-3.5" />
                  Arquivar card
                </RailAction>

                <ConfirmDialog
                  title={`Excluir ${card.title}?`}
                  description="Comentários e anexos vão junto. Não dá para desfazer — arquivar guarda tudo."
                  confirmLabel="Excluir card"
                  destructive
                  onConfirm={() => router.delete(`/cards/${card.id}`)}
                >
                  <RailAction destructive>Excluir card</RailAction>
                </ConfirmDialog>
              </div>
            )}
          </aside>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/** Fundo tingido e texto na própria cor: branco sobre verde saturado não passava de 3:1. */
function StatePill({ completed }: { completed: boolean }) {
  const Icon = completed ? CircleCheckIcon : CircleDotIcon

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        completed ? 'border-done/25 bg-done/12 text-done' : 'border-open/25 bg-open/12 text-open',
      )}
    >
      <Icon className="size-3.5" />
      {completed ? 'Concluído' : 'Aberto'}
    </span>
  )
}

function CompletionButton({ card }: { card: CardDetail }) {
  const url = `/cards/${card.id}/completion`

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() =>
        card.completed
          ? router.delete(url, { preserveScroll: true })
          : router.post(url, {}, { preserveScroll: true })
      }
    >
      {card.completed ? <CircleDotIcon /> : <CircleCheckIcon />}
      {card.completed ? 'Reabrir card' : 'Concluir card'}
    </Button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

function RailRow({
  label,
  action,
  children,
}: {
  label: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="border-b py-3 last:border-b-0">
      <div className="flex min-h-6 items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        {action}
      </div>

      <div className="mt-1.5">{children}</div>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-muted-foreground">{children}</span>
}

function RailAction({
  destructive,
  children,
  ...props
}: React.ComponentProps<'button'> & { destructive?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex w-full items-center gap-2 rounded-sm px-1 py-1 text-left text-xs transition-colors hover:bg-accent',
        destructive ? 'text-destructive' : 'text-muted-foreground hover:text-foreground',
      )}
      {...props}
    >
      {children}
    </button>
  )
}
