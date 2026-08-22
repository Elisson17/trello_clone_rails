module Lists
  class PositionsController < ApplicationController
    before_action :set_list

    def update
      authorize @list, :update?

      result = Lists::Move.call(list: @list, index: params.expect(:index))
      redirect_to board_path(@list.board), alert: (t("lists.move_failed") if result.failure?)
    end

    private

    def set_list
      @list = List.includes(:board).find(params[:list_id])
    end
  end
end
