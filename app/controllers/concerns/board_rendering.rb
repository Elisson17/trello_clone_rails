module BoardRendering
  extend ActiveSupport::Concern

  private

  def render_board(board, card: nil, activities: nil)
    props = { board: BoardPresenter.new(board).as_json, can: board_permissions(board) }
    props[:card] = CardPresenter.new(card, user: current_user).as_json if card
    props[:activities] = activities.as_json if activities

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
