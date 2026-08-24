class BoardsController < ApplicationController
  include BoardRendering

  before_action :set_board

  def show
    authorize @board

    record_visit
    render_board(@board)
  end

  def update
    authorize @board

    if @board.update(board_params)
      record_activity("board.updated", @board, title: @board.title)
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

  # `upsert` e nunca `touch`: `board.touch` a cada visita invalidaria o cache do payload
  # do board, que é o ganho medido na etapa 8.
  def record_visit
    now = Time.current

    BoardVisit.upsert(
      { user_id: current_user.id, board_id: @board.id,
        viewed_at: now, created_at: now, updated_at: now },
      unique_by: %i[user_id board_id]
    )
  end
end
