module Boards
  # Copia a estrutura do board, não o histórico: listas, cards, labels, checklists,
  # membros e responsáveis. Comentários e anexos ficam de fora de propósito — são o
  # registro de uma conversa que aconteceu naquele board, não parte do molde.
  class Duplicate < ApplicationInteractor
    def initialize(board:, creator:)
      @board = board
      @creator = creator
    end

    def call
      copy = build_copy
      return failure(copy.errors) unless copy.valid?

      transaction do
        copy.save!
        duplicate_memberships(copy)
        duplicate_lists(copy, duplicate_labels(copy))
      end

      success(copy)
    end

    private

    def build_copy
      Board.new(
        workspace: @board.workspace, creator: @creator,
        title: "#{@board.title} (cópia)", description: @board.description,
        visibility: @board.visibility, background: @board.background,
        position: @board.workspace.boards.next_position
      )
    end

    def duplicate_memberships(copy)
      copy.board_memberships.create!(user: @creator, role: :admin)

      @board.board_memberships.where.not(user: @creator).each do |membership|
        copy.board_memberships.create!(user: membership.user, role: membership.role)
      end
    end

    # De id antigo para label nova: é o mapa que religa os cards às labels da cópia.
    def duplicate_labels(copy)
      @board.labels.to_h do |label|
        [ label.id, copy.labels.create!(name: label.name, color: label.color) ]
      end
    end

    def duplicate_lists(copy, labels)
      @board.lists.active.ordered.each do |list|
        new_list = copy.lists.create!(list.slice(:title, :position))

        list.cards.active.ordered.each { |card| duplicate_card(card, new_list, labels) }
      end
    end

    def duplicate_card(card, list, labels)
      copy = list.cards.create!(
        card.slice(:title, :description, :position, :due_at, :completed_at, :cover_color)
            .merge(creator: @creator)
      )

      copy.labels = card.label_ids.map { |id| labels.fetch(id) }
      copy.assignees = card.assignees
      card.checklists.each { |checklist| duplicate_checklist(checklist, copy) }
    end

    def duplicate_checklist(checklist, card)
      copy = card.checklists.create!(checklist.slice(:title, :position))

      checklist.items.each { |item| copy.items.create!(item.slice(:content, :position, :completed_at)) }
    end
  end
end
