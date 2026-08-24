module Workspaces
  class InvitationsController < ApplicationController
    before_action :set_workspace

    rate_limit to: 20, within: 10.minutes, only: :create, with: :too_many_attempts

    def create
      invitation = @workspace.invitations.new(invitation_params.merge(invited_by: current_user))
      authorize invitation

      result = ::Workspaces::Invite.call(
        workspace: @workspace, invited_by: current_user,
        email_address: invitation.email_address, role: invitation.role
      )

      if result.success?
        redirect_to workspace_memberships_path(@workspace), notice: t("invitations.sent")
      else
        redirect_to workspace_memberships_path(@workspace), inertia: { errors: result.errors.first }
      end
    end

    def destroy
      invitation = @workspace.invitations.find(params[:id])
      authorize invitation

      invitation.destroy
      redirect_to workspace_memberships_path(@workspace), notice: t("invitations.revoked")
    end

    private

    def set_workspace
      @workspace = Workspace.find_by!(slug: params[:workspace_id])
    end

    # Papel é privilégio: allowlist explícita, com fallback no menos privilegiado.
    def invitation_params
      { email_address: params[:email_address],
        role: params[:role].presence_in(Membership.roles.keys) || "member" }
    end

    def too_many_attempts
      redirect_to workspace_memberships_path(@workspace), alert: t("auth.rate_limited")
    end
  end
end
