class BoardChannel < ApplicationCable::Channel
  # Assinar o canal é ler o board, então vale a mesma policy do `BoardsController#show`.
  def subscribed
    board = Board.find_by(id: params[:id])

    return reject unless board && BoardPolicy.new(current_user, board).show?

    stream_for board
  end
end
