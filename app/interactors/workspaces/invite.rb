module Workspaces
  class Invite < ApplicationInteractor
    def initialize(workspace:, invited_by:, email_address:, role: :member)
      @invitation = workspace.invitations.new(
        invited_by: invited_by, email_address: email_address, role: role
      )
    end

    def call
      return failure(@invitation.errors) unless @invitation.save

      Invitations::SendMailJob.perform_later(@invitation.id)
      success(@invitation)
    end
  end
end
