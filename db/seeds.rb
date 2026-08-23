return unless Rails.env.development?

def seed_user(email, name:, confirmed: true)
  user = User.find_or_initialize_by(email: email)
  user.update!(
    name: name,
    password: "supersecret",
    time_zone: "America/Sao_Paulo",
    confirmed_at: confirmed ? Time.current : nil
  )
  if user.owned_workspaces.where(personal: true).none?
    workspace = Workspace.create!(name: "Espaço de #{name.split.first}", owner: user, personal: true)
    workspace.memberships.create!(user: user, role: :owner)
  end
  user
end

demo = seed_user("demo@example.com", name: "Demo Silva")
ana = seed_user("ana@example.com", name: "Ana Souza")
seed_user("pendente@example.com", name: "Pendente Lima", confirmed: false)

team = Workspace.find_or_create_by!(slug: "time-de-produto") do |workspace|
  workspace.name = "Time de Produto"
  workspace.owner = demo
end
team.memberships.find_or_create_by!(user: demo) { |m| m.role = :owner }
team.memberships.find_or_create_by!(user: ana) { |m| m.role = :admin }

team.invitations.find_or_create_by!(email_address: "convidada@example.com", accepted_at: nil) do |invitation|
  invitation.invited_by = demo
  invitation.role = :member
end

board = team.boards.find_or_initialize_by(title: "Roadmap do produto")
if board.new_record?
  board = Boards::Create.call(
    workspace: team, creator: demo,
    attributes: { title: "Roadmap do produto", background: "sky", visibility: :workspace_wide }
  ).value
  team.memberships.where.not(user: demo).each do |membership|
    board.board_memberships.create!(user: membership.user, role: :member)
  end

  cards = {
    "A fazer" => [ "Desenhar o modal do card", "Escolher a lib de drag & drop", "Escrever o ARCHITECTURE.md" ],
    "Fazendo" => [ "Boards, listas e cards (etapa 4)" ],
    "Feito" => [ "Autenticação com Devise", "Workspaces e convites" ]
  }
  board.lists.ordered.each do |list|
    cards.fetch(list.title, []).each do |title|
      Cards::Create.call(list: list, creator: demo, attributes: { title: title })
    end
  end
  board.lists.find_by(title: "A fazer").cards.first&.update!(due_at: 2.days.from_now)

  # Etapa 6: o modal do card só se demonstra com etiqueta, checklist e comentário dentro.
  labels = { "bug" => "rose", "produto" => "sky", "infra" => "amber" }.map do |name, color|
    board.labels.create!(name: name, color: color)
  end

  primeiro = board.lists.find_by(title: "A fazer").cards.ordered.first
  primeiro.update!(
    description: "Rota `/cards/:id` com o board vivo atrás.\n\n- [x] Decidir a rota\n- [ ] Desenhar a barra lateral",
    cover_color: "sky"
  )
  primeiro.labels = labels.first(2)
  primeiro.assignees = [ demo, ana ]
  passos = primeiro.checklists.create!(title: "Passos", position: 1024)
  [ [ "Levantar o payload", true ], [ "Montar o modal", true ], [ "Anexos", false ] ]
    .each.with_index(1) do |(content, done), index|
      passos.items.create!(content: content, position: index * 1024, completed_at: (Time.current if done))
    end
  primeiro.comments.create!(user: ana, body: "Dá para reaproveitar o `EditableTitle` no título do card.")

  board.lists.find_by(title: "Fazendo").cards.first&.update!(cover_color: "amber")

  # Etapa 7: feed vazio não demonstra feed. As atividades entram pelo mesmo job que o
  # controller usa — nada de INSERT paralelo só para as seeds.
  historico = [
    [ "board.created", board, demo, { title: board.title } ],
    [ "list.created", board.lists.ordered.first, demo, { title: "A fazer" } ],
    [ "card.created", primeiro, demo, { title: primeiro.title } ],
    [ "card.labeled", primeiro, ana, { title: primeiro.title, name: "produto" } ],
    [ "card.assigned", primeiro, ana, { title: primeiro.title, assignee_id: demo.id, name: demo.name } ]
  ]
  historico.each.with_index do |(action, subject, autor, metadata), index|
    RecordActivityJob.perform_now(action: action, board_id: board.id, user_id: autor.id,
                                  subject_type: subject.class.name, subject_id: subject.id,
                                  metadata: metadata)
    Activity.last.update_columns(created_at: (historico.size - index).hours.ago)
  end

  # Menção e prazo chegando: as duas notificações que a central mostra.
  mencao = primeiro.comments.create!(user: ana, body: "@demo confere o payload do feed?")
  RecordActivityJob.perform_now(action: "comment.created", board_id: board.id, user_id: ana.id,
                                subject_type: "Card", subject_id: primeiro.id,
                                metadata: { title: primeiro.title, body: mencao.body })
  NotifyMentionsJob.perform_now(Activity.last.id)

  board.lists.find_by(title: "Fazendo").cards.first&.tap do |card|
    card.update!(due_at: 8.hours.from_now)
    card.card_assignments.create!(user: demo)
  end
  DueSoonReminderJob.perform_now
end

puts <<~INFO
  Seeds prontas. Senha de todos: supersecret
    demo@example.com      owner de "Time de Produto"
    ana@example.com       admin de "Time de Produto"
    pendente@example.com  conta sem confirmar
  Convite pendente: #{team.invitations.pending.first&.token&.then { |t| "/invitations/#{t}/accept" }}
  Board de exemplo: /boards/#{team.boards.first&.id}
INFO
