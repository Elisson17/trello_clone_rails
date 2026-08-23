module Workspaces
  class BoardsController < ApplicationController
    before_action :set_workspace

    def index
      authorize @workspace, :show?

      render inertia: "Workspaces/ArchivedBoards", props: {
        workspace: { slug: @workspace.slug, name: @workspace.name },
        boards: board_props(scoped_boards.archived)
      }
    end

    def create
      board = @workspace.boards.new(creator: current_user)
      authorize board

      result = ::Boards::Create.call(workspace: @workspace, creator: current_user,
                                     attributes: board_params)

      if result.success?
        record_activity("board.created", result.value, title: result.value.title)
        redirect_to board_path(result.value), notice: t("boards.created")
      else
        redirect_to workspace_path(@workspace), inertia: { errors: result.errors.first }
      end
    end

    private

    def set_workspace
      @workspace = Workspace.find_by!(slug: params[:workspace_id])
    end

    def board_params
      params.permit(:title, :description, :background, :visibility)
    end

    def scoped_boards = policy_scope(@workspace.boards)

    def board_props(relation)
      relation.ordered.map do |board|
        { id: board.id, title: board.title, background: board.background,
          visibility: board.visibility, lists_count: board.lists_count,
          archived: board.archived? }
      end
    end
  end
end
