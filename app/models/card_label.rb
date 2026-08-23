class CardLabel < ApplicationRecord
  belongs_to :card
  belongs_to :label

  validates :label_id, uniqueness: { scope: :card_id }
  validate :label_belongs_to_the_same_board

  private

  # Sem isto, um id forjado cola no card a label de outro board.
  def label_belongs_to_the_same_board
    return if label.nil? || card.nil? || label.board_id == card.list.board_id

    errors.add(:label, :other_board)
  end
end
