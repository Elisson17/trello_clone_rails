module Cards
  class ChecklistsController < ApplicationController
    include CardScoped

    def create
      authorize @card, :update?
      checklist = @card.checklists.new(title: params[:title], position: @card.checklists.next_position)

      record_activity("checklist.created", @card, title: @card.title, name: checklist.title) if checklist.save
      back_to_card_with(checklist.errors)
    end

    def destroy
      authorize @card, :update?

      checklist = @card.checklists.find(params[:id])

      checklist.destroy
      record_activity("checklist.removed", @card, title: @card.title, name: checklist.title)
      back_to_card
    end

    private

    def back_to_card_with(errors)
      errors.blank? ? back_to_card : redirect_to(card_path(@card), inertia: { errors: errors })
    end
  end
end
