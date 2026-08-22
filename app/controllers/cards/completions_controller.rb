module Cards
  class CompletionsController < ApplicationController
    before_action :set_card

    def create = toggle(Time.current)
    def destroy = toggle(nil)

    private

    def toggle(value)
      authorize @card, :update?

      @card.update!(completed_at: value)
      redirect_to board_path(@card.list.board)
    end

    def set_card
      @card = Card.includes(list: :board).find(params[:card_id])
    end
  end
end
