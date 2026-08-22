module Invitations
  class SendMailJob < ApplicationJob
    queue_as :default

    discard_on ActiveJob::DeserializationError

    def perform(invitation_id)
      invitation = Invitation.find_by(id: invitation_id)
      return unless invitation&.usable?

      InvitationMailer.invite(invitation).deliver_now
    end
  end
end
