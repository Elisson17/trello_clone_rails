module Lists
  class ArchivesController < ApplicationController
    def destroy
      list = List.includes(:board).find(params[:list_id])
      authorize list, :update?

      list.restore!
      record_activity("list.restored", list, title: list.title)
      redirect_back fallback_location: board_path(list.board), notice: t("lists.restored")
    end
  end
end
