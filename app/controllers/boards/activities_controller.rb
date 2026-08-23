module Boards
  class ActivitiesController < ApplicationController
    include BoardRendering

    def index
      board = Board.includes(:workspace).find(params[:board_id])
      authorize board, :show?

      pagy, activities = pagy(board.activities.recent.includes(:user), limit: 20)
      render_board(board, activities: ActivityPresenter.new(activities, pagy))
    end
  end
end
