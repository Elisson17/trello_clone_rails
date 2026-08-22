module Cards
  class Create < ApplicationInteractor
    def initialize(list:, creator:, attributes: {})
      @card = list.cards.new(attributes.merge(creator: creator))
      @card.position = list.cards.next_position
    end

    attr_reader :card

    def call
      return failure(@card.errors) unless @card.save

      success(@card)
    end
  end
end
