# Todo controller aninhado em card carrega o mesmo card e volta para a mesma página.
module CardScoped
  extend ActiveSupport::Concern

  included do
    before_action :set_card
  end

  private

  def set_card
    @card = Card.includes(list: :board).find(params[:card_id])
  end

  def board = @card.list.board

  def back_to_card(notice: nil, alert: nil) = redirect_to card_path(@card), notice: notice, alert: alert
end
