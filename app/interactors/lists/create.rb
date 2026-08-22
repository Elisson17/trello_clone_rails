module Lists
  class Create < ApplicationInteractor
    def initialize(board:, attributes: {})
      @list = board.lists.new(attributes)
      @list.position = board.lists.next_position
    end

    attr_reader :list

    def call
      return failure(@list.errors) unless @list.save

      success(@list)
    end
  end
end
