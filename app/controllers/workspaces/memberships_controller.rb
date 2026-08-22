module Workspaces
  class MembershipsController < ApplicationController
    before_action :set_workspace
    before_action :set_membership, only: %i[update destroy]

    def index
      authorize @workspace, :show?

      render inertia: "Workspaces/Members", props: {
        workspace: { id: @workspace.id, slug: @workspace.slug, name: @workspace.name,
                     personal: @workspace.personal },
        members: members_props,
        invitations: invitations_props,
        roles: Membership.roles.keys,
        can: { manage_members: manage_members? }
      }
    end

    def update
      authorize @membership

      if @membership.update(role: params.require(:role))
        redirect_to workspace_memberships_path(@workspace), notice: t("memberships.updated")
      else
        redirect_to workspace_memberships_path(@workspace), inertia: { errors: @membership.errors }
      end
    end

    def destroy
      authorize @membership
      leaving = @membership.user_id == current_user.id

      if @membership.destroy
        redirect_to(leaving ? workspaces_path : workspace_memberships_path(@workspace),
                    notice: t(leaving ? "memberships.left" : "memberships.removed"))
      else
        redirect_to workspace_memberships_path(@workspace), alert: @membership.errors.full_messages.to_sentence
      end
    end

    private

    def set_workspace
      @workspace = Workspace.find_by!(slug: params[:workspace_id])
    end

    def set_membership
      @membership = @workspace.memberships.find(params[:id])
    end

    def manage_members? = policy(@workspace).manage_members?

    def members_props
      @workspace.memberships.ordered.includes(user: { avatar_attachment: :blob }).map do |membership|
        {
          id: membership.id,
          role: membership.role,
          is_self: membership.user_id == current_user.id,
          can_update: policy(membership).update?,
          can_destroy: policy(membership).destroy?,
          user: {
            id: membership.user.id,
            name: membership.user.name,
            email: membership.user.email,
            avatar_url: membership.user.avatar.attached? ? url_for(membership.user.avatar) : nil
          }
        }
      end
    end

    def invitations_props
      return [] unless manage_members?

      @workspace.invitations.pending.order(created_at: :desc).map do |invitation|
        {
          id: invitation.id,
          email_address: invitation.email_address,
          role: invitation.role,
          expires_at: invitation.expires_at.iso8601,
          expired: invitation.expired?
        }
      end
    end
  end
end
