class CardAssignment < ApplicationRecord
  belongs_to :card, touch: true
  belongs_to :user

  validates :user_id, uniqueness: { scope: :card_id }
  validate :user_must_be_a_board_member

  private

  # Responsável precisa enxergar o card.
  def user_must_be_a_board_member
    return if user.nil? || card.nil? || card.list.board.membership_for(user).present?

    errors.add(:user, :not_a_member)
  end
end
