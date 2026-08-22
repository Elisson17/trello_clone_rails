class CardsController < ApplicationController
  before_action :set_list, only: :create
  before_action :set_card, only: %i[update destroy]

  def create
    card = @list.cards.new
    authorize card

    result = Cards::Create.call(list: @list, creator: current_user, attributes: card_params)
    respond_to_board(@list.board, result.errors.first)
  end

  def update
    authorize @card

    @card.update(card_params)
    respond_to_board(@card.list.board, @card.errors)
  end

  def destroy
    authorize @card

    @card.destroy
    redirect_to board_path(@card.list.board), notice: t("cards.destroyed")
  end

  private

  def set_list
    @list = List.includes(:board).find(params[:list_id])
  end

  def set_card
    @card = Card.includes(list: :board).find(params[:id])
  end

  def card_params
    params.permit(:title, :description, :due_at, :cover_color)
  end

  def respond_to_board(board, errors)
    if errors.blank?
      redirect_to board_path(board)
    else
      redirect_to board_path(board), inertia: { errors: errors }
    end
  end
end
