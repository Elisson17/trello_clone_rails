class MembershipPolicy < ApplicationPolicy
  def update? = (actor&.manages? && record.user_id != user.id) || false

  def destroy?
    return false if record.last_owner?

    record.user_id == user.id || actor&.manages? || false
  end

  private

  def actor = membership_in(record.workspace)
end
