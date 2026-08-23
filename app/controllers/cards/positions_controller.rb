module Cards
  class PositionsController < ApplicationController
    include CardScoped

    def update
      authorize @card, :update?
      list = board.lists.active.find(params.expect(:list_id))

      origin = @card.list.title
      result = Cards::Move.call(card: @card, list: list, index: params.expect(:index))
      record_activity("card.moved", @card, title: @card.title, from: origin, to: list.title) if result.success?
      redirect_to board_path(list.board), alert: (t("cards.move_failed") if result.failure?)
    end
  end
end
