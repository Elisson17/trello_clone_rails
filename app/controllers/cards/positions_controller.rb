module Cards
  class PositionsController < ApplicationController
    before_action :set_card

    def update
      authorize @card, :update?
      list = @card.list.board.lists.active.find(params.expect(:list_id))

      result = Cards::Move.call(card: @card, list: list, index: params.expect(:index))
      redirect_to board_path(list.board), alert: (t("cards.move_failed") if result.failure?)
    end

    private

    def set_card
      @card = Card.includes(list: :board).find(params[:card_id])
    end
  end
end
