import { Head, usePage } from '@inertiajs/react'

import type { SharedProps } from '@/types/inertia'

export default function Home() {
  const { auth } = usePage<SharedProps>().props

  return (
    <div className="min-h-screen bg-background p-10">
      <Head title="Home" />
      <h1 className="text-3xl font-bold text-foreground">Olá, {auth.user?.name} 👋</h1>
      <p className="mt-2 text-muted-foreground">
        Seus boards aparecem aqui a partir da etapa 4 do roadmap.
      </p>
    </div>
  )
}
