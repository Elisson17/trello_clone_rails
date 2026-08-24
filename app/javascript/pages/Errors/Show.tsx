import { Head, Link } from '@inertiajs/react'
import { ArrowLeftIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

/** Uma página para 404, 422 e 500: o que muda é o número e a frase, que vêm do servidor. */
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
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <Head title={`${status} · ${title}`} />

      <span className="text-6xl font-bold tabular-nums text-muted-foreground/40">{status}</span>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>

      <Button asChild variant="outline" className="mt-8">
        <Link href="/">
          <ArrowLeftIcon />
          Voltar para os workspaces
        </Link>
      </Button>
    </div>
  )
}
