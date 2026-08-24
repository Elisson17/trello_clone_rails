class WorkspacesController < ApplicationController
  before_action :set_workspace, only: %i[show update destroy]

  def index
    authorize Workspace

    render inertia: "Workspaces/Index", props: {
      recent_boards: recent_boards_props,
      workspaces: policy_scope(Workspace).ordered.includes(memberships: { user: { avatar_attachment: :blob } })
                                         .map { |workspace| workspace_props(workspace) }
    }
  end

  def show
    authorize @workspace

    render inertia: "Workspaces/Show", props: {
      workspace: workspace_props(@workspace),
      boards: board_props(policy_scope(Board).where(workspace: @workspace).active),
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
      redirect_to workspaces_path, inertia: { errors: workspace.errors }
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
    redirect_to workspaces_path, notice: t("workspaces.destroyed")
  end

  private

  def set_workspace
    @workspace = Workspace.find_by!(slug: params[:id])
  end

  def workspace_params
    params.permit(:name)
  end

  def recent_boards_props
    policy_scope(Board).active.includes(:workspace).order(updated_at: :desc).limit(6).map do |board|
      { id: board.id, title: board.title, background: board.background,
        workspace: { slug: board.workspace.slug, name: board.workspace.name } }
    end
  end

  def board_props(relation)
    relation.ordered.map do |board|
      { id: board.id, title: board.title, background: board.background,
        visibility: board.visibility, lists_count: board.lists_count }
    end
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
