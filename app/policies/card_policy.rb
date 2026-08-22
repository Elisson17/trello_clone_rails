class CardPolicy < ApplicationPolicy
  def show? = board_policy.show?
  def create? = board_policy.manage_cards?
  def update? = board_policy.manage_cards?
  def destroy? = board_policy.manage_cards?
  def archive? = board_policy.manage_cards?

  private

  def board_policy = @board_policy ||= BoardPolicy.new(user, record.list.board)
end
