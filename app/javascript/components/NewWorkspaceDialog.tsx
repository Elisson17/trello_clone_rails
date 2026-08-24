import { useForm } from '@inertiajs/react'
import { PlusIcon } from 'lucide-react'
import { type ReactNode, useState } from 'react'

import { Input } from '@/components/Input'
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

/**
 * Não há rota `/workspaces/new`: criar workspace é um diálogo, não uma página. Por isso o
 * gatilho é injetável — a sidebar precisa dele com cara de item de menu, e a tela vazia
 * com cara de botão primário.
 */
export function NewWorkspaceDialog({ trigger }: { trigger?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const form = useForm({ name: '' })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) form.reset()
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <PlusIcon />
            Novo workspace
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            form.post('/workspaces', {
              onSuccess: () => {
                form.reset()
                setOpen(false)
              },
            })
          }}
        >
          <DialogHeader>
            <DialogTitle>Novo workspace</DialogTitle>
            <DialogDescription>
              Você entra como owner e pode convidar outras pessoas depois.
            </DialogDescription>
          </DialogHeader>

          <div className="py-5">
            <Input
              label="Nome"
              required
              autoFocus
              maxLength={80}
              placeholder="Time de produto"
              value={form.data.name}
              error={form.errors.name}
              onChange={(event) => form.setData('name', event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={form.processing}>
              {form.processing ? 'Criando…' : 'Criar workspace'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
