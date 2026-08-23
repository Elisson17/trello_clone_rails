class ListsController < ApplicationController
  before_action :set_board, only: :create
  before_action :set_list, only: %i[update destroy]

  def create
    list = @board.lists.new
    authorize list

    result = Lists::Create.call(board: @board, attributes: list_params)
    record_activity("list.created", result.value, title: result.value.title) if result.success?
    respond_to_board(@board, result.errors.first)
  end

  def update
    authorize @list

    record_activity("list.renamed", @list, title: @list.title) if @list.update(list_params)
    respond_to_board(@list.board, @list.errors)
  end

  # Excluir lista arquiva: os cards vão junto, sem cascata silenciosa (§3.5).
  def destroy
    authorize @list

    @list.archive!
    record_activity("list.archived", @list, title: @list.title)
    redirect_to board_path(@list.board), notice: t("lists.archived")
  end

  private

  def set_board
    @board = Board.find(params[:board_id])
  end

  def set_list
    @list = List.includes(:board).find(params[:id])
  end

  def list_params
    params.permit(:title)
  end

  def respond_to_board(board, errors)
    if errors.blank?
      redirect_to board_path(board)
    else
      redirect_to board_path(board), inertia: { errors: errors }
    end
  end
end
