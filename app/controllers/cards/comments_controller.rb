module Cards
  class CommentsController < ApplicationController
    include CardScoped

    before_action :set_comment, only: %i[update destroy]

    def create
      comment = @card.comments.new(body: params[:body], user: current_user)
      authorize comment

      comment.save
      back_to_card_with(comment.errors)
    end

    # A janela de 15 min do §3.6 vive na policy, não aqui: expirou, a policy recusa.
    def update
      authorize @comment

      @comment.update(body: params[:body], edited_at: Time.current)
      back_to_card_with(@comment.errors)
    end

    def destroy
      authorize @comment

      @comment.destroy
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
