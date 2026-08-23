module Cards
  class LabelsController < ApplicationController
    include CardScoped

    def create
      authorize @card, :update?
      card_label = @card.card_labels.new(label_id: params.expect(:label_id))

      record_activity("card.labeled", @card, title: @card.title, name: card_label.label&.name) if card_label.save
      back_to_card(alert: (t("labels.other_board") if card_label.errors.any?))
    end

    def destroy
      authorize @card, :update?

      removed = @card.card_labels.find_by(label_id: params[:id])
      removed&.destroy
      record_activity("card.unlabeled", @card, title: @card.title, name: removed.label.name) if removed
      back_to_card
    end
  end
end
