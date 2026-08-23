# Board e card compartilham a mesma página Inertia: o modal do card é a página do board
# com uma prop a mais. É isso que mantém o board vivo por trás sem recarregar nada.
module BoardRendering
  extend ActiveSupport::Concern

  private

  def render_board(board, card: nil)
    props = { board: BoardPresenter.new(board).as_json, can: board_permissions(board) }
    props[:card] = CardPresenter.new(card, user: current_user).as_json if card

    render inertia: "Boards/Show", props: props
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
