module Cards
  class CommentsController < ApplicationController
    include CardScoped

    before_action :set_comment, only: %i[update destroy]

    def create
      comment = @card.comments.new(body: params[:body], user: current_user)
      authorize comment

      record_activity("comment.created", @card, title: @card.title, body: comment.body) if comment.save
      back_to_card_with(comment.errors)
    end

    # A janela de 15 min para editar vive na policy.
    def update
      authorize @comment

      record_activity("comment.updated", @card, title: @card.title) if @comment.update(body: params[:body], edited_at: Time.current)
      back_to_card_with(@comment.errors)
    end

    def destroy
      authorize @comment

      @comment.destroy
      record_activity("comment.removed", @card, title: @card.title)
      back_to_card(notice: t("comments.destroyed"))
    end

    private

    def set_comment
      @comment = @card.comments.find(params[:id])
    end

    def back_to_card_with(errors)
      errors.blank? ? back_to_card : redirect_to(card_path(@card), inertia: { errors: errors })
    end
  end
end
