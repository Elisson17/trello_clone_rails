# Payload da grade de boards. A home lista board de todos os workspaces, então nada aqui
# pode ser por board: cada agregado é uma query só, com o agrupamento feito em memória.
class BoardsIndexPresenter
  PREVIEW_LISTS = 6
  AVATARS = 3

  def initialize(boards:, user:)
    @user = user
    @boards = boards.includes(:workspace, creator: { avatar_attachment: :blob }).to_a
  end

  def as_json(*)
    boards.map { |board| board_props(board) }
  end

  private

  attr_reader :boards, :user

  def board_ids = @board_ids ||= boards.map(&:id)

  def board_props(board)
    bars = preview_for(board)

    {
      id: board.id,
      title: board.title,
      background: board.background,
      visibility: board.visibility,
      updated_at: board.updated_at.iso8601,
      workspace: { slug: board.workspace.slug, name: board.workspace.name },
      owner: user_props(board.creator),
      last_visited_at: visits[board.id]&.iso8601,
      members: members_props(board),
      preview: bars,
      counts: {
        lists: lists_by_board.fetch(board.id, []).size,
        # Total do board, não da preview: listas além da 6ª ficam fora da vitrine mas
        # continuam contando.
        cards: lists_by_board.fetch(board.id, []).sum { |list_id| cards_by_list.fetch(list_id, []).size },
        overdue: overdue_counts.fetch(board.id, 0)
      }
    }
  end

  def user_props(user) = { id: user.id, name: user.name, avatar_url: user.avatar_url }

  def members_props(board)
    memberships = memberships_by_board.fetch(board.id, [])

    { avatars: memberships.first(AVATARS).map { |m| user_props(m.user) },
      total: memberships.size }
  end

  # Cada lista vira uma barra: a altura é a contagem, o empilhamento são as capas.
  def preview_for(board)
    lists_by_board.fetch(board.id, []).first(PREVIEW_LISTS).map do |list_id|
      colors = cards_by_list.fetch(list_id, [])

      { list_id: list_id, count: colors.size, colors: colors.compact.sort }
    end
  end

  def lists_by_board
    @lists_by_board ||= List.active.where(board_id: board_ids)
                            .order(:position, :id)
                            .pluck(:board_id, :id)
                            .group_by(&:first)
                            .transform_values { |rows| rows.map(&:last) }
  end

  # Uma query para os cards de todos os boards da tela, agrupada por lista e cor de capa.
  def cards_by_list
    @cards_by_list ||= Card.active.joins(:list).where(lists: { board_id: board_ids })
                           .group("lists.id", :cover_color).count
                           .each_with_object(Hash.new { |hash, key| hash[key] = [] }) do |((list_id, color), count), grouped|
                             grouped[list_id].concat(Array.new(count, color))
                           end
  end

  def overdue_counts
    @overdue_counts ||= Card.active.overdue.joins(:list)
                            .where(lists: { board_id: board_ids })
                            .group("lists.board_id").count
  end

  def memberships_by_board
    @memberships_by_board ||= BoardMembership.where(board_id: board_ids)
                                             .includes(user: { avatar_attachment: :blob })
                                             .order(:id)
                                             .group_by(&:board_id)
  end

  def visits
    @visits ||= BoardVisit.where(user: user, board_id: board_ids)
                          .pluck(:board_id, :viewed_at).to_h
  end
end
