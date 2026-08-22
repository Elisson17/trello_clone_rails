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
      lists: lists.map { |list| list_props(list) },
      cards_count: cards_by_list.values.sum(&:size)
    }
  end

  private

  def lists = @lists ||= @board.lists.active.ordered.to_a

  # Uma query para todos os cards do board, agrupados em memória. Nada de `list.cards`
  # dentro do loop, que é exatamente o N+1 que este presenter existe para evitar.
  def cards_by_list
    @cards_by_list ||= Card.active.where(list_id: lists.map(&:id)).ordered.group_by(&:list_id)
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
      comments_count: card.comments_count
    }
  end
end
