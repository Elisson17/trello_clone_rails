module Invitations
  class Accept < ApplicationInteractor
    def initialize(invitation:, user:)
      @invitation = invitation
      @user = user
    end

    def call
      return failure(:expired) if @invitation.expired?
      return failure(:already_accepted) if @invitation.accepted?
      return failure(:wrong_email) unless @invitation.email_address == @user.email

      membership = nil
      transaction do
        membership = @invitation.workspace.memberships
                                .find_or_create_by!(user: @user) { |m| m.role = @invitation.role }
        @invitation.update!(accepted_at: Time.current)
      end

      success(membership)
    end
  end
end
