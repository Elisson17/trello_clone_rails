import { Head, Link } from '@inertiajs/react'

type Board = { id: number; title: string }

export default function Home({ name, boards }: { name: string; boards: Board[] }) {
  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <Head title="Home" />
      <h1 className="text-3xl font-bold text-slate-800">Olá, {name} 👋</h1>
      <p className="mt-2 text-slate-600">Rails + Inertia + React funcionando.</p>

      <ul className="mt-6 space-y-2">
        {boards.map((board) => (
          <li key={board.id} className="rounded bg-white px-4 py-2 shadow">
            {board.title}
          </li>
        ))}
      </ul>

      <Link href="/" className="mt-6 inline-block text-blue-600 underline">
        Recarregar via Inertia
      </Link>
    </div>
  )
}
