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
      # `redirect_back`: restaurar acontece no painel de arquivados, e quem está
      # restaurando três cards não quer voltar ao board a cada um.
      redirect_back fallback_location: board_path(board), notice: t("cards.restored")
    end
  end
end
