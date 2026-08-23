module Cards
  # Mesma ideia do `LabelsController`: o `:id` da rota é o id do **usuário**.
  class AssignmentsController < ApplicationController
    include CardScoped

    def create
      authorize @card, :update?
      assignment = @card.card_assignments.new(user_id: params.expect(:user_id))

      assignment.save
      back_to_card(alert: (t("card_assignments.not_a_member") if assignment.errors.any?))
    end

    def destroy
      authorize @card, :update?

      @card.card_assignments.find_by(user_id: params[:id])&.destroy
      back_to_card
    end
  end
end
