class Card < ApplicationRecord
  include Positioned
  include Archivable

  belongs_to :list, counter_cache: :cards_count
  belongs_to :creator, class_name: "User"

  has_one :board, through: :list

  validates :title, presence: true, length: { maximum: 200 }
  validates :description, length: { maximum: 10_000 }
  validate :board_within_card_quota, on: :create

  scope :overdue, -> { where(completed_at: nil).where(due_at: ...Time.current) }

  def completed? = completed_at.present?

  # Derivado, nunca persistido (§3.5).
  def overdue? = due_at.present? && completed_at.nil? && due_at.past?

  private

  def board_within_card_quota
    return unless list && list.board.cards.active.count >= Limits[:cards_per_board]

    errors.add(:base, :quota_exceeded, limit: Limits[:cards_per_board])
  end
end
