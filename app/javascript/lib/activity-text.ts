import type { ActivityPayload } from '@/types/inertia'

type Meta = ActivityPayload['metadata']

const quote = (value: unknown) => `«${String(value ?? '')}»`

/** Dentro do painel do card, repetir o título do card em toda linha é ruído. */
const card = (meta: Meta, bare: boolean) => (bare ? 'o card' : `o card ${quote(meta.title)}`)
const on = (meta: Meta, bare: boolean) => (bare ? '' : ` em ${quote(meta.title)}`)

const ROLES: Record<string, string> = {
  admin: 'administrador',
  member: 'membro',
  viewer: 'observador',
}

const FIELDS: Record<string, string> = {
  title: 'o título',
  description: 'a descrição',
  due_at: 'o prazo',
  cover_color: 'a capa',
  completed_at: 'a conclusão',
}

// "o título e o prazo" — `Intl.ListFormat` já sabe onde entra o "e".
const list = new Intl.ListFormat('pt-BR', { style: 'long', type: 'conjunction' })

function editedFields(meta: Meta, bare: boolean) {
  const fields = (Array.isArray(meta.fields) ? meta.fields : [])
    .map((field) => FIELDS[field])
    .filter(Boolean)

  if (fields.length === 0) return `editou ${card(meta, bare)}`

  return `editou ${list.format(fields)}${bare ? '' : ` de ${quote(meta.title)}`}`
}

/**
 * Cada ação sabe escrever a própria frase. O sujeito é quem agiu e vem antes, no
 * componente: aqui começa sempre no verbo.
 */
const SENTENCES: Record<string, (meta: Meta, bare: boolean) => string> = {
  'board.created': () => 'criou este board',
  'board.updated': () => 'editou o board',
  'board.archived': () => 'arquivou o board',
  'board.restored': () => 'restaurou o board',
  'board.duplicated': (meta) => `duplicou ${quote(meta.source)} aqui`,

  'label.created': (meta) => `criou a etiqueta ${quote(meta.name)}`,
  'label.removed': (meta) => `excluiu a etiqueta ${quote(meta.name)}`,

  'member.added': (meta) => `adicionou ${meta.name} como ${ROLES[String(meta.role)] ?? meta.role}`,
  'member.role_changed': (meta) =>
    `mudou ${meta.name} para ${ROLES[String(meta.role)] ?? meta.role}`,
  'member.removed': (meta) => `removeu ${meta.name} do board`,

  'list.created': (meta) => `criou a lista ${quote(meta.title)}`,
  'list.renamed': (meta) => `renomeou uma lista para ${quote(meta.title)}`,
  'list.archived': (meta) => `arquivou a lista ${quote(meta.title)}`,
  'list.moved': (meta) => `moveu a lista ${quote(meta.title)}`,

  'card.created': (meta, bare) => `criou ${card(meta, bare)}`,
  'card.updated': editedFields,
  'card.moved': (meta, bare) => `moveu ${card(meta, bare)} de ${meta.from} para ${meta.to}`,
  'card.completed': (meta, bare) => `concluiu ${card(meta, bare)}`,
  'card.reopened': (meta, bare) => `reabriu ${card(meta, bare)}`,
  'card.archived': (meta, bare) => `arquivou ${card(meta, bare)}`,
  'card.restored': (meta, bare) => `restaurou ${card(meta, bare)}`,
  'card.deleted': (meta) => `excluiu ${card(meta, false)}`,
  'card.labeled': (meta, bare) => `marcou a etiqueta ${quote(meta.name)}${on(meta, bare)}`,
  'card.unlabeled': (meta, bare) => `tirou a etiqueta ${quote(meta.name)}${on(meta, bare)}`,
  'card.assigned': (meta, bare) => `atribuiu ${card(meta, bare)} a ${meta.name}`,
  'card.unassigned': (meta, bare) => `tirou ${meta.name} de ${card(meta, bare)}`,
  'card.due_soon': (meta, bare) =>
    `o prazo ${bare ? 'deste card' : `de ${quote(meta.title)}`} vence nas próximas 24 horas`,

  'comment.created': (meta, bare) => `comentou${on(meta, bare) || ' neste card'}`,
  'comment.updated': (meta, bare) => `editou um comentário${on(meta, bare)}`,
  'comment.removed': (meta, bare) => `apagou um comentário${on(meta, bare)}`,

  'attachment.added': (meta, bare) => `anexou ${meta.filename}${on(meta, bare)}`,
  'attachment.removed': (meta, bare) => `removeu o anexo ${meta.filename}${on(meta, bare)}`,

  'checklist.created': (meta, bare) =>
    `criou a lista de tarefas ${quote(meta.name)}${on(meta, bare)}`,
  'checklist.removed': (meta, bare) =>
    `excluiu a lista de tarefas ${quote(meta.name)}${on(meta, bare)}`,
}

/**
 * `bare` é o feed dentro do próprio card, onde o card já é o contexto da tela.
 * Ação desconhecida cai na própria chave, para feed novo com front antigo não quebrar.
 */
export function activityText(activity: ActivityPayload, bare = false) {
  return SENTENCES[activity.action]?.(activity.metadata, bare) ?? activity.action
}
