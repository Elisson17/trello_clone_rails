module Boards
  class ArchivesController < ApplicationController
    before_action :set_board

    def create
      authorize @board, :archive?

      @board.archive!
      redirect_to workspace_path(@board.workspace), notice: t("boards.archived")
    end

    def destroy
      authorize @board, :archive?

      @board.restore!
      redirect_to board_path(@board), notice: t("boards.restored")
    end

    private

    def set_board
      @board = Board.includes(:workspace).find(params[:board_id])
    end
  end
end
