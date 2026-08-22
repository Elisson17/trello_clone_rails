import { Head, Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'

type Board = { id: number; title: string }

export default function Home({ name, boards }: { name: string; boards: Board[] }) {
  return (
    <div className="min-h-screen bg-background p-10">
      <Head title="Home" />
      <h1 className="text-3xl font-bold text-foreground">Olá, {name} 👋</h1>
      <p className="mt-2 text-muted-foreground">Rails + Inertia + React funcionando.</p>

      <ul className="mt-6 space-y-2">
        {boards.map((board) => (
          <li key={board.id} className="rounded bg-card px-4 py-2 text-card-foreground shadow">
            {board.title}
          </li>
        ))}
      </ul>

      <Button asChild className="mt-6">
        <Link href="/">Recarregar via Inertia</Link>
      </Button>
    </div>
  )
}
