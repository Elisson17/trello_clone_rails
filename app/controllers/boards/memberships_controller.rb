module Boards
  # A tela de membros do board, herdada da etapa 4: só agora ela tem um segundo uso
  # (é a lista de quem pode ser responsável por um card).
  class MembershipsController < ApplicationController
    before_action :set_board

    def create
      authorize @board, :manage_members?
      # Só membro do workspace entra no board — convidar de fora é papel do convite.
      user = @board.workspace.users.find(params.expect(:user_id))
      membership = @board.board_memberships.new(user: user, role: params[:role] || :member)

      membership.save
      respond_with(membership.errors)
    end

    def update
      authorize @board, :manage_members?

      membership = @board.board_memberships.find(params[:id])
      membership.update(role: params.expect(:role))
      respond_with(membership.errors)
    end

    def destroy
      authorize @board, :manage_members?

      @board.board_memberships.find(params[:id]).destroy
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
