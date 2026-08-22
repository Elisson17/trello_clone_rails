class InvitationPolicy < ApplicationPolicy
  def create? = actor&.manages? || false
  def destroy? = actor&.manages? || false

  private

  def actor = membership_in(record.workspace)
end
