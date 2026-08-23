module Cards
  class PositionsController < ApplicationController
    include CardScoped

    def update
      authorize @card, :update?
      list = board.lists.active.find(params.expect(:list_id))

      result = Cards::Move.call(card: @card, list: list, index: params.expect(:index))
      redirect_to board_path(list.board), alert: (t("cards.move_failed") if result.failure?)
    end
  end
end
