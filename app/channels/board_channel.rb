class BoardChannel < ApplicationCable::Channel
  # Assinar é ler o board: a mesma policy do `BoardsController#show`, porque o evento conta
  # que algo mudou naquele board — e isso já é informação.
  def subscribed
    board = Board.find_by(id: params[:id])

    return reject unless board && BoardPolicy.new(current_user, board).show?

    stream_for board
  end
end
