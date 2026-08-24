class BroadcastBoardJob < ApplicationJob
  queue_as :default

  # Evento magro: só o id do board e quem mudou. Quem recebe pede a prop nova pelo
  # Inertia, então o servidor continua sendo a única fonte.
  def perform(board_id, by_user_id = nil)
    board = Board.find_by(id: board_id)
    return if board.nil?

    BoardChannel.broadcast_to(board, type: "board.updated", by: by_user_id)
  end
end
