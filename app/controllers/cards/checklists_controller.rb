module Cards
  class ChecklistsController < ApplicationController
    include CardScoped

    def create
      authorize @card, :update?
      checklist = @card.checklists.new(title: params[:title], position: @card.checklists.next_position)

      checklist.save
      back_to_card_with(checklist.errors)
    end

    def destroy
      authorize @card, :update?

      @card.checklists.find(params[:id]).destroy
      back_to_card
    end

    private

    def back_to_card_with(errors)
      errors.blank? ? back_to_card : redirect_to(card_path(@card), inertia: { errors: errors })
    end
  end
end
