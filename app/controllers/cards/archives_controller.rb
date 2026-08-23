module Cards
  class ArchivesController < ApplicationController
    include CardScoped

    def create
      authorize @card, :archive?

      @card.archive!
      redirect_to board_path(board), notice: t("cards.archived")
    end

    def destroy
      authorize @card, :archive?

      @card.restore!
      redirect_to board_path(board), notice: t("cards.restored")
    end
  end
end
