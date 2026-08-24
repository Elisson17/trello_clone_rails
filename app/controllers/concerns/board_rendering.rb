module BoardRendering
  extend ActiveSupport::Concern

  private

  def render_board(board, card: nil, activities: nil)
    props = { board: board_props(board), can: board_permissions(board) }
    props[:card] = CardPresenter.new(card, user: current_user).as_json if card
    props[:activities] = activities.as_json if activities

    render inertia: "Boards/Show", props: props
  end

  # O payload do board é a parte caríssima da página (uma dezena de queries e todo o
  # `as_json`), e é igual para todo mundo que vê o board — logo, cache compartilhado.
  # A chave é só o `updated_at`: a cadeia inteira dá `touch` no board (ver `Board`).
  def board_props(board)
    Rails.cache.fetch([ "board", board.id, board.updated_at.to_f ]) do
      BoardPresenter.new(board).as_json
    end
  end

  def board_permissions(board)
    policy = policy(board)

    {
      update: policy.update?,
      destroy: policy.destroy?,
      archive: policy.archive?,
      manage_members: policy.manage_members?
    }
  end
end
