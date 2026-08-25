import { Head, Link } from '@inertiajs/react'
import { ArrowLeftIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

/** Uma página para 404, 422 e 500: número e frase vêm do servidor. */
export default function ErrorShow({
  status,
  title,
  message,
}: {
  status: number
  title: string
  message: string
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-start px-4 py-24">
      <Head title={`${status} · ${title}`} />

      <span className="rounded-md border px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
        Erro {status}
      </span>

      <h1 className="mt-4 text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted-foreground">{message}</p>

      <Button asChild variant="outline" className="mt-6">
        <Link href="/">
          <ArrowLeftIcon />
          Voltar para os boards
        </Link>
      </Button>
    </div>
  )
}
