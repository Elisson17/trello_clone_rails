module Cards
  # Marcar e desmarcar a label no card. O `:id` da rota é o id da **label**, não o da
  # linha de junção: do lado do front existe um alvo só, a label, ligada ou desligada.
  class LabelsController < ApplicationController
    include CardScoped

    def create
      authorize @card, :update?
      card_label = @card.card_labels.new(label_id: params.expect(:label_id))

      card_label.save
      back_to_card(alert: (t("labels.other_board") if card_label.errors.any?))
    end

    def destroy
      authorize @card, :update?

      @card.card_labels.find_by(label_id: params[:id])&.destroy
      back_to_card
    end
  end
end
