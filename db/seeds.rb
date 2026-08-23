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
end

puts <<~INFO
  Seeds prontas. Senha de todos: supersecret
    demo@example.com      owner de "Time de Produto"
    ana@example.com       admin de "Time de Produto"
    pendente@example.com  conta sem confirmar
  Convite pendente: #{team.invitations.pending.first&.token&.then { |t| "/invitations/#{t}/accept" }}
  Board de exemplo: /boards/#{team.boards.first&.id}
INFO
