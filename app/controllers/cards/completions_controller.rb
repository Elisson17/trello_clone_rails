module Cards
  class CompletionsController < ApplicationController
    include CardScoped

    def create = toggle(Time.current)
    def destroy = toggle(nil)

    private

    # Concluir acontece nos dois lugares — no tile do board e dentro do modal —, então a
    # resposta volta para a página de onde veio, em vez de fechar o modal.
    def toggle(value)
      authorize @card, :update?

      @card.update!(completed_at: value)
      redirect_back fallback_location: board_path(board)
    end
  end
end
