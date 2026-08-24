import { useForm } from '@inertiajs/react'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { BACKGROUND_LABELS, BOARD_THEME } from '@/lib/board-theme'
import { cn } from '@/lib/utils'
import type { BoardBackground, BoardVisibility, NavWorkspace } from '@/types/inertia'

export function NewBoardDialog({
  workspaceSlug,
  workspaces,
  backgrounds,
}: {
  workspaceSlug?: string
  workspaces?: NavWorkspace[]
  backgrounds: BoardBackground[]
}) {
  const [open, setOpen] = useState(false)
  const form = useForm({
    title: '',
    background: backgrounds[0],
    visibility: 'workspace_wide' as BoardVisibility,
    workspace: workspaceSlug ?? workspaces?.[0]?.slug ?? '',
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) form.reset()
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Novo board
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            form.post(`/workspaces/${form.data.workspace}/boards`, {
              onSuccess: () => {
                form.reset()
                setOpen(false)
              },
            })
          }}
        >
          <DialogHeader>
            <DialogTitle>Novo board</DialogTitle>
            <DialogDescription>
              Ele já nasce com as listas A fazer, Fazendo e Feito.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-5">
            {!workspaceSlug && workspaces && workspaces.length > 1 && (
              <Select
                label="Workspace"
                value={form.data.workspace}
                onChange={(event) => form.setData('workspace', event.target.value)}
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.slug} value={workspace.slug}>
                    {workspace.name}
                  </option>
                ))}
              </Select>
            )}

            <Input
              label="Título"
              required
              autoFocus
              maxLength={120}
              placeholder="Roadmap do produto"
              value={form.data.title}
              error={form.errors.title}
              onChange={(event) => form.setData('title', event.target.value)}
            />

            <fieldset>
              <legend className="text-[13px] font-semibold">Cor</legend>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {backgrounds.map((background) => (
                  <label
                    key={background}
                    className={cn(
                      'flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors has-[:checked]:border-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                    )}
                  >
                    <input
                      type="radio"
                      name="background"
                      className="sr-only"
                      value={background}
                      checked={form.data.background === background}
                      onChange={() => form.setData('background', background)}
                    />
                    <span
                      aria-hidden
                      className={cn('size-3 rounded-full', BOARD_THEME[background].rail)}
                    />
                    {BACKGROUND_LABELS[background]}
                  </label>
                ))}
              </div>
            </fieldset>

            <Select
              label="Quem vê"
              value={form.data.visibility}
              error={form.errors.visibility}
              onChange={(event) =>
                form.setData('visibility', event.target.value as BoardVisibility)
              }
            >
              <option value="workspace_wide">Todo o workspace</option>
              <option value="private_to_members">Só quem eu adicionar</option>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={form.processing}>
              {form.processing ? 'Criando…' : 'Criar board'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
