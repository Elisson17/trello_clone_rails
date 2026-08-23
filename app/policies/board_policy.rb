class BoardPolicy < ApplicationPolicy
  def show? = board_membership.present? || workspace_wide_access?

  def create? = workspace_membership.present?

  def update? = board_membership&.writes? || workspace_manager?
  def archive? = update?

  # Excluir de verdade é só do admin do board (ou de quem administra o workspace).
  def destroy? = board_membership&.admin? || workspace_manager?

  def manage_lists? = update?
  def manage_cards? = update?

  # Quem entra e sai do board, e quem pode apagar comentário de outro: admin do board.
  def manage_members? = destroy?

  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none if user.nil?

      scope.where(id: BoardMembership.where(user: user).select(:board_id))
           .or(scope.where(visibility: :workspace_wide, workspace_id: user_workspace_ids))
    end

    private

    def user_workspace_ids = Membership.where(user: user).select(:workspace_id)
  end

  private

  def board_membership
    return nil if user.nil?

    @board_membership ||= record.membership_for(user)
  end

  def workspace_membership = membership_in(record.workspace)

  def workspace_manager? = workspace_membership&.manages? || false

  def workspace_wide_access? = record.workspace_wide? && workspace_membership.present?
end
