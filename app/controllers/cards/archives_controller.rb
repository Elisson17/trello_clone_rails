module Cards
  class ArchivesController < ApplicationController
    include CardScoped

    def create
      authorize @card, :archive?

      @card.archive!
      record_activity("card.archived", @card, title: @card.title)
      redirect_to board_path(board), notice: t("cards.archived")
    end

    def destroy
      authorize @card, :archive?

      @card.restore!
      record_activity("card.restored", @card, title: @card.title)
      redirect_to board_path(board), notice: t("cards.restored")
    end
  end
end
