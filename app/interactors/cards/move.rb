module Cards
  class Move < ApplicationInteractor
    def initialize(card:, list:, index:)
      @card = card
      @list = list
      @index = index.to_i
    end

    def call
      return failure(:different_board) unless @list.board_id == @card.list.board_id

      siblings = @list.cards.active.ordered.where.not(id: @card.id).to_a
      index = @index.clamp(0, siblings.size)
      before = siblings[index - 1] if index.positive?
      after = siblings[index]

      @card.list = @list
      @card.position = Card.position_between(before&.position, after&.position)
      return failure(@card.errors) unless @card.save

      enqueue_rebalance(before, after)
      success(@card)
    end

    private

    def enqueue_rebalance(before, after)
      return unless @card.crowded?(before) || @card.crowded?(after)

      RebalancePositionsJob.perform_later(@list, "cards")
    end
  end
end
