import ReactMarkdown from 'react-markdown'

/**
 * Descrição e comentário são Markdown renderizado no front. O `react-markdown` monta
 * elementos React em vez de HTML cru, então não há `dangerouslySetInnerHTML` nem a porta
 * de XSS que um `marked` + sanitizador teria que fechar.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-sm [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_strong]:font-semibold">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  )
}
