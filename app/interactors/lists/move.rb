module Lists
  class Move < ApplicationInteractor
    def initialize(list:, index:)
      @list = list
      @index = index.to_i
    end

    def call
      before, after = nil
      moved = List.transaction do
        siblings = @list.board.lists.active.ordered.where.not(id: @list.id).to_a
        index = @index.clamp(0, siblings.size)
        before = siblings[index - 1] if index.positive?
        after = siblings[index]

        @list.position = List.position_between(before&.position, after&.position)
        @list.save
      end
      return failure(@list.errors) unless moved

      enqueue_rebalance(before, after)
      success(@list)
    end

    private

    def enqueue_rebalance(before, after)
      return unless @list.crowded?(before) || @list.crowded?(after)

      RebalancePositionsJob.perform_later(@list.board, "lists")
    end
  end
end
