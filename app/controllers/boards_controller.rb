class BoardsController < ApplicationController
  include BoardRendering

  before_action :set_board

  def show
    authorize @board

    render_board(@board)
  end

  def update
    authorize @board

    if @board.update(board_params)
      redirect_to board_path(@board), notice: t("boards.updated")
    else
      redirect_to board_path(@board), inertia: { errors: @board.errors }
    end
  end

  def destroy
    authorize @board
    workspace = @board.workspace

    @board.destroy
    redirect_to workspace_path(workspace), notice: t("boards.destroyed")
  end

  private

  def set_board
    @board = Board.includes(:workspace).find(params[:id])
  end

  def board_params
    params.permit(:title, :description, :background, :visibility)
  end
end
