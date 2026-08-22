# Aceite de convite pelo link do e-mail. `show` é a única action do app aberta a quem não
# está logado: ela mostra o convite e guarda o destino para o Devise voltar depois do login.
class InvitationsController < ApplicationController
  skip_before_action :authenticate_user!, only: :show
  skip_after_action :verify_authorized

  before_action :set_invitation

  def show
    store_location_for(:user, request.fullpath) unless user_signed_in?

    render inertia: "Invitations/Accept", props: {
      invitation: {
        token: @invitation.token,
        email_address: @invitation.email_address,
        role: @invitation.role,
        workspace_name: @invitation.workspace.name,
        invited_by_name: @invitation.invited_by.name,
        expires_at: @invitation.expires_at.iso8601
      },
      state: invitation_state
    }
  end

  def accept
    result = Invitations::Accept.call(invitation: @invitation, user: current_user)

    if result.success?
      redirect_to workspace_path(@invitation.workspace), notice: t("invitations.accepted")
    else
      redirect_to accept_invitation_path(token: @invitation.token),
                  alert: t("invitations.errors.#{result.errors.first}")
    end
  end

  private

  def set_invitation
    @invitation = Invitation.find_by!(token: params[:token])
  end

  def invitation_state
    return "accepted" if @invitation.accepted?
    return "expired" if @invitation.expired?
    return "signed_out" unless user_signed_in?
    return "wrong_email" unless @invitation.email_address == current_user.email

    "ready"
  end
end
