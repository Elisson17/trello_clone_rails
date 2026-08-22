module Cards
  class ArchivesController < ApplicationController
    before_action :set_card

    def create
      authorize @card, :archive?

      @card.archive!
      redirect_to board_path(@card.list.board), notice: t("cards.archived")
    end

    def destroy
      authorize @card, :archive?

      @card.restore!
      redirect_to board_path(@card.list.board), notice: t("cards.restored")
    end

    private

    def set_card
      @card = Card.includes(list: :board).find(params[:card_id])
    end
  end
end
