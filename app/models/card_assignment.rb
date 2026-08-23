class CardAssignment < ApplicationRecord
  belongs_to :card
  belongs_to :user

  validates :user_id, uniqueness: { scope: :card_id }
  validate :user_must_be_a_board_member

  private

  # Responsável tem que ver o card (§3.6 vale para menção; aqui é a mesma ideia).
  def user_must_be_a_board_member
    return if user.nil? || card.nil? || card.list.board.membership_for(user).present?

    errors.add(:user, :not_a_member)
  end
end
