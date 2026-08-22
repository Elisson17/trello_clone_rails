# Idempotente: pode rodar quantas vezes quiser (bin/setup roda por você).
return unless Rails.env.development?

def seed_user(email, name:, confirmed: true)
  user = User.find_or_initialize_by(email: email)
  user.update!(
    name: name,
    password: "supersecret",
    time_zone: "America/Sao_Paulo",
    confirmed_at: confirmed ? Time.current : nil
  )
  # Cadastro normal passa pelo Users::Register; aqui garantimos o mesmo estado.
  if user.owned_workspaces.where(personal: true).none?
    workspace = Workspace.create!(name: "Espaço de #{name.split.first}", owner: user, personal: true)
    workspace.memberships.create!(user: user, role: :owner)
  end
  user
end

demo = seed_user("demo@example.com", name: "Demo Silva")
ana = seed_user("ana@example.com", name: "Ana Souza")
seed_user("pendente@example.com", name: "Pendente Lima", confirmed: false)

# Workspace compartilhado: a demo é owner, a Ana entrou por convite aceito.
team = Workspace.find_or_create_by!(slug: "time-de-produto") do |workspace|
  workspace.name = "Time de Produto"
  workspace.owner = demo
end
team.memberships.find_or_create_by!(user: demo) { |m| m.role = :owner }
team.memberships.find_or_create_by!(user: ana) { |m| m.role = :admin }

# Um convite pendente para exercitar a tela de membros e o link do e-mail.
team.invitations.find_or_create_by!(email_address: "convidada@example.com", accepted_at: nil) do |invitation|
  invitation.invited_by = demo
  invitation.role = :member
end

# Um board de verdade para a home não abrir vazia.
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
end

puts <<~INFO
  Seeds prontas. Senha de todos: supersecret
    demo@example.com      owner de "Time de Produto"
    ana@example.com       admin de "Time de Produto"
    pendente@example.com  conta sem confirmar
  Convite pendente: #{team.invitations.pending.first&.token&.then { |t| "/invitations/#{t}/accept" }}
  Board de exemplo: /boards/#{team.boards.first&.id}
INFO
