module Cards
  class CompletionsController < ApplicationController
    include CardScoped

    def create = toggle(Time.current)
    def destroy = toggle(nil)

    private

    def toggle(value)
      authorize @card, :update?

      @card.update!(completed_at: value)
      record_activity(value ? "card.completed" : "card.reopened", @card, title: @card.title)
      redirect_back fallback_location: board_path(board)
    end
  end
end
