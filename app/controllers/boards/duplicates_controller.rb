module Boards
  class DuplicatesController < ApplicationController
    def create
      board = Board.includes(:workspace).find(params[:board_id])
      authorize board, :create?

      result = Boards::Duplicate.call(board: board, creator: current_user)
      return redirect_to board_path(board), alert: t("boards.duplicate_failed") if result.failure?

      redirect_to board_path(result.value), notice: t("boards.duplicated")
    end
  end
end
