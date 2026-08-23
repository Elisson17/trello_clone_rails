module Cards
  # Anexo entra pelo card, não por um endpoint de upload próprio: a allowlist e o teto
  # de 5 por card são validação do `Card` (§3.8), então o card é quem tem que salvar.
  class AttachmentsController < ApplicationController
    include CardScoped

    def create
      authorize @card, :update?

      # `attach` salva o card, então a validação de tipo e de tamanho roda aqui mesmo:
      # arquivo recusado devolve `false` e nada é anexado.
      return back_to_card if @card.attachments.attach(params.expect(:file))

      redirect_to card_path(@card), inertia: { errors: @card.errors }
    end

    def destroy
      authorize @card, :update?

      @card.attachments.find(params[:id]).purge_later
      back_to_card(notice: t("attachments.destroyed"))
    end
  end
end
