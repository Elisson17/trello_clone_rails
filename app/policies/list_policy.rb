class ListPolicy < ApplicationPolicy
  def show? = board_policy.show?
  def create? = board_policy.manage_lists?
  def update? = board_policy.manage_lists?
  def destroy? = board_policy.manage_lists?
  def archive? = board_policy.manage_lists?

  private

  def board_policy = @board_policy ||= BoardPolicy.new(user, record.board)
end
