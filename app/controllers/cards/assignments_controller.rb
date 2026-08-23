module Cards
  # Mesma ideia do `LabelsController`: o `:id` da rota é o id do **usuário**.
  class AssignmentsController < ApplicationController
    include CardScoped

    def create
      authorize @card, :update?
      assignment = @card.card_assignments.new(user_id: params.expect(:user_id))

      if assignment.save
        record_activity("card.assigned", @card, title: @card.title,
                        assignee_id: assignment.user_id, name: assignment.user.name)
      end
      back_to_card(alert: (t("card_assignments.not_a_member") if assignment.errors.any?))
    end

    def destroy
      authorize @card, :update?

      removed = @card.card_assignments.find_by(user_id: params[:id])
      removed&.destroy
      record_activity("card.unassigned", @card, title: @card.title, name: removed.user.name) if removed
      back_to_card
    end
  end
end
