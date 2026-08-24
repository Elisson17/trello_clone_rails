class SearchesController < ApplicationController
  RESULT_LIMIT = 10

  def show
    # Não há registro para autorizar: o filtro é o `policy_scope` de board.
    skip_authorization

    render inertia: "Search/Index", props: {
      term: term,
      boards: boards.map { |board| board_props(board) },
      cards: cards.map { |card| card_props(card) }
    }
  end

  private

  def term = params[:q].to_s.strip

  def visible_boards = policy_scope(Board).active

  def boards
    ids = SearchIndex.match(term, type: "Board")
    return [] if ids.empty?

    visible_boards.where(id: ids).includes(:workspace).to_a.sort_by { |board| ids.index(board.id) }
  end

  def cards
    ids = SearchIndex.match(term, type: "Card")
    return [] if ids.empty?

    Card.active.where(id: ids)
        .joins(list: :board).merge(List.active).where(lists: { board_id: visible_boards.select(:id) })
        .includes(list: { board: :workspace })
        .to_a.sort_by { |card| ids.index(card.id) }
  end

  def board_props(board)
    { id: board.id, title: board.title, background: board.background,
      workspace: { slug: board.workspace.slug, name: board.workspace.name } }
  end

  def card_props(card)
    { id: card.id, title: card.title, completed: card.completed?, due_at: card.due_at&.iso8601,
      list: { id: card.list.id, title: card.list.title },
      board: { id: card.list.board.id, title: card.list.board.title,
               background: card.list.board.background } }
  end
end
