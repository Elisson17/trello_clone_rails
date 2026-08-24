module Boards
  class ArchivedController < ApplicationController
    def show
      @board = Board.includes(:workspace).find(params[:board_id])
      authorize @board, :show?

      render inertia: "Boards/Archived", props: {
        board: { id: @board.id, title: @board.title },
        can: { restore: policy(@board).update? },
        lists: @board.lists.archived.ordered.map { |list| list_props(list) },
        cards: archived_cards.map { |card| card_props(card) }
      }
    end

    private

    def list_props(list)
      { id: list.id, title: list.title, archived_at: list.archived_at.iso8601,
        cards_count: list.cards.active.count }
    end

    # Card arquivado à parte da lista: se a lista também está arquivada, restaurar o card
    # não o traz de volta ao board, e é isso que a tela avisa.
    def archived_cards
      Card.archived.where(list_id: @board.lists.select(:id)).includes(:list).ordered
    end

    def card_props(card)
      { id: card.id, title: card.title, archived_at: card.archived_at.iso8601,
        list: { id: card.list.id, title: card.list.title, archived: card.list.archived? } }
    end
  end
end
