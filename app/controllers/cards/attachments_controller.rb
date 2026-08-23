module Cards
  class AttachmentsController < ApplicationController
    include CardScoped

    def create
      authorize @card, :update?

      if @card.attachments.attach(params.expect(:file))
        record_activity("attachment.added", @card, title: @card.title,
                        filename: @card.attachments.last.filename.to_s)
        return back_to_card
      end

      redirect_to card_path(@card), inertia: { errors: @card.errors }
    end

    def destroy
      authorize @card, :update?

      attachment = @card.attachments.find(params[:id])

      attachment.purge_later
      record_activity("attachment.removed", @card, title: @card.title, filename: attachment.filename.to_s)
      back_to_card(notice: t("attachments.destroyed"))
    end
  end
end
