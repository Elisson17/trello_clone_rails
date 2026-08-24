class WorkspacesController < ApplicationController
  before_action :set_workspace, only: %i[show update destroy]

  def show
    authorize @workspace

    render inertia: "Boards/Index", props: {
      workspace: workspace_props(@workspace),
      boards: BoardsIndexPresenter.new(boards: policy_scope(Board).where(workspace: @workspace).active,
                                       user: current_user).as_json,
      archived_count: policy_scope(Board).where(workspace: @workspace).archived.count,
      backgrounds: Board::BACKGROUNDS,
      can: {
        update: policy(@workspace).update?,
        destroy: policy(@workspace).destroy?,
        manage_members: policy(@workspace).manage_members?,
        leave: policy(@workspace).leave?,
        create_board: policy(Board.new(workspace: @workspace)).create?
      }
    }
  end

  def create
    authorize Workspace

    workspace = Workspace.new(workspace_params.merge(owner: current_user))
    if workspace.save
      workspace.memberships.create!(user: current_user, role: :owner)
      redirect_to workspace_path(workspace), notice: t("workspaces.created")
    else
      redirect_to root_path, inertia: { errors: workspace.errors }
    end
  end

  def update
    authorize @workspace

    if @workspace.update(workspace_params)
      redirect_to workspace_path(@workspace), notice: t("workspaces.updated")
    else
      redirect_to workspace_path(@workspace), inertia: { errors: @workspace.errors }
    end
  end

  def destroy
    authorize @workspace

    @workspace.destroy
    redirect_to root_path, notice: t("workspaces.destroyed")
  end

  private

  def set_workspace
    @workspace = Workspace.find_by!(slug: params[:id])
  end

  def workspace_params
    params.permit(:name)
  end

  def user_avatar_props(user)
    { id: user.id, name: user.name, avatar_url: user.avatar_url }
  end

  def workspace_props(workspace)
    membership = workspace.membership_for(current_user)

    {
      id: workspace.id,
      slug: workspace.slug,
      name: workspace.name,
      personal: workspace.personal,
      members_count: workspace.memberships.size,
      role: membership&.role,
      membership_id: membership&.id,
      members_preview: workspace.memberships.first(5).map { |m| user_avatar_props(m.user) }
    }
  end
end
