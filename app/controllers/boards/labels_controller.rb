module Boards
  # Labels são do board, não do card: criar aqui e marcar no card são coisas diferentes
  # (ver `Cards::LabelsController`).
  class LabelsController < ApplicationController
    before_action :set_board

    def create
      authorize @board, :update?
      label = @board.labels.new(label_params)

      label.save
      respond_with(label.errors)
    end

    def destroy
      authorize @board, :update?

      @board.labels.find(params[:id]).destroy
      redirect_back fallback_location: board_path(@board), notice: t("labels.destroyed")
    end

    private

    def set_board
      @board = Board.includes(:workspace).find(params[:board_id])
    end

    def label_params = params.permit(:name, :color)

    def respond_with(errors)
      target = { fallback_location: board_path(@board) }

      errors.blank? ? redirect_back(**target) : redirect_back(**target, inertia: { errors: errors })
    end
  end
end
