import { createInertiaApp } from '@inertiajs/react'
import type { ReactElement, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { initTheme } from '@/hooks/use-theme'
import AppLayout from '@/layouts/app-layout'
import '../styles/application.css'

type PageModule = {
  default: ((props: Record<string, unknown>) => ReactElement) & {
    layout?: (page: ReactNode) => ReactNode
  }
}

initTheme()

createInertiaApp({
  resolve: (name) => {
    // `!(*.test)` fica de fora de propósito: arquivo de teste importado aqui roda `vi.mock`
    // no browser, estoura no eval e derruba o app inteiro em tela branca.
    const pages = import.meta.glob<PageModule>('../pages/**/!(*.test).tsx', { eager: true })
    const page = pages[`../pages/${name}.tsx`]
    if (!page) throw new Error(`Página Inertia não encontrada: ${name}`)

    // Layout padrão para todas as páginas; a página pode sobrescrever com `Page.layout`.
    page.default.layout ??= (children) => <AppLayout>{children}</AppLayout>
    return page
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
})
