class InvitationMailer < ApplicationMailer
  def invite(invitation)
    @invitation = invitation
    @workspace = invitation.workspace
    @url = accept_invitation_url(token: invitation.token)

    mail to: invitation.email_address,
         subject: t("invitation_mailer.invite.subject", workspace: @workspace.name)
  end
end
