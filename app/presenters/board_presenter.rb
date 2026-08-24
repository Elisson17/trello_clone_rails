class BoardPresenter
  def initialize(board)
    @board = board
  end

  def as_json(*)
    {
      id: @board.id,
      title: @board.title,
      description: @board.description,
      visibility: @board.visibility,
      background: @board.background,
      archived: @board.archived?,
      workspace: { slug: @board.workspace.slug, name: @board.workspace.name },
      members: memberships.map { |membership| member_props(membership) },
      # Única lista que a tela de membros não consegue derivar do que já está na página.
      workspace_members: @board.workspace.users.order(:name).map { |user| user_props(user) },
      labels: @board.labels.order(:name).map { |label| label_props(label) },
      lists: lists.map { |list| list_props(list) },
      cards_count: cards_by_list.values.sum(&:size)
    }
  end

  private

  def label_props(label) = { id: label.id, name: label.name, color: label.color }

  def member_props(membership)
    {
      id: membership.id,
      role: membership.role,
      user: { id: membership.user.id, name: membership.user.name,
              email: membership.user.email, avatar_url: membership.user.avatar_url }
    }
  end

  def memberships = @memberships ||= @board.board_memberships.includes(:user).order(:id).to_a

  def lists = @lists ||= @board.lists.active.ordered.to_a

  # Uma query para todos os cards do board, agrupados em memória, em vez de `list.cards`
  # dentro do loop. Os badges (labels, responsáveis, checklist, anexos) entram por eager
  # load: mais queries, mas um número fixo, que não cresce com o tamanho do board.
  def cards_by_list
    @cards_by_list ||= Card.active
                           .where(list_id: lists.map(&:id))
                           .includes(:labels, :assignees, checklists: :items)
                           .with_attached_attachments
                           .ordered
                           .group_by(&:list_id)
  end

  def list_props(list)
    {
      id: list.id,
      title: list.title,
      position: list.position.to_f,
      cards: cards_by_list.fetch(list.id, []).map { |card| card_props(card) }
    }
  end

  def card_props(card)
    {
      id: card.id,
      title: card.title,
      position: card.position.to_f,
      due_at: card.due_at&.iso8601,
      completed: card.completed?,
      overdue: card.overdue?,
      cover_color: card.cover_color,
      comments_count: card.comments_count,
      attachments_count: card.attachments.size,
      has_description: card.description.present?,
      labels: card.labels.map { |label| label_props(label) },
      assignees: card.assignees.map { |user| user_props(user) },
      checklist: checklist_progress(card)
    }
  end

  def user_props(user) = { id: user.id, name: user.name, avatar_url: user.avatar_url }

  def checklist_progress(card)
    items = card.checklists.flat_map(&:items)
    return nil if items.empty?

    { done: items.count(&:completed?), total: items.size }
  end
end
