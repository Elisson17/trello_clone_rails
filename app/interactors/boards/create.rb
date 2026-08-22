module Boards
  class Create < ApplicationInteractor
    def initialize(workspace:, creator:, attributes: {}, with_default_lists: true)
      @board = workspace.boards.new(attributes.merge(creator: creator))
      @board.position = workspace.boards.next_position
      @creator = creator
      @with_default_lists = with_default_lists
    end

    attr_reader :board

    def call
      return failure(@board.errors) unless @board.valid?

      transaction do
        @board.save!
        @board.board_memberships.create!(user: @creator, role: :admin)
        create_default_lists if @with_default_lists
      end

      success(@board)
    end

    private

    def create_default_lists
      Board::DEFAULT_LISTS.each_with_index do |title, index|
        @board.lists.create!(title: title, position: (index + 1) * Positioned::STEP)
      end
    end
  end
end
