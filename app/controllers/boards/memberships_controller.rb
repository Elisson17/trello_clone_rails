module Boards
  class MembershipsController < ApplicationController
    before_action :set_board

    def create
      authorize @board, :manage_members?
      # Só membro do workspace entra no board — convidar de fora é papel do convite.
      user = @board.workspace.users.find(params.expect(:user_id))
      membership = @board.board_memberships.new(user: user, role: params[:role] || :member)

      record_activity("member.added", @board, name: user.name, role: membership.role) if membership.save
      respond_with(membership.errors)
    end

    def update
      authorize @board, :manage_members?

      membership = @board.board_memberships.find(params[:id])
      membership.update(role: params.expect(:role))
      record_activity("member.role_changed", @board, name: membership.user.name, role: membership.role)
      respond_with(membership.errors)
    end

    def destroy
      authorize @board, :manage_members?

      membership = @board.board_memberships.find(params[:id])

      membership.destroy
      record_activity("member.removed", @board, name: membership.user.name)
      redirect_to board_path(@board), notice: t("board_memberships.removed")
    end

    private

    def set_board
      @board = Board.includes(:workspace).find(params[:board_id])
    end

    def respond_with(errors)
      if errors.blank?
        redirect_to board_path(@board)
      else
        redirect_to board_path(@board), inertia: { errors: errors }
      end
    end
  end
end
