class WorkspacePolicy < ApplicationPolicy
  def index? = user.present?
  def create? = user.present?

  def show? = membership.present?
  def update? = membership&.owner?
  def destroy? = membership&.owner? && !record.personal?

  def manage_members? = membership&.manages? || false
  def leave? = membership.present? && !record.personal? && !membership.last_owner?

  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none if user.nil?

      scope.where(id: Membership.where(user: user).select(:workspace_id))
    end
  end

  private

  def membership = membership_in(record)
end
