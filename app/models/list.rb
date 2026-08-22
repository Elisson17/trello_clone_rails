class List < ApplicationRecord
  include Positioned
  include Archivable

  belongs_to :board, counter_cache: :lists_count
  has_many :cards, dependent: :destroy

  validates :title, presence: true, length: { maximum: 80 }
  validate :board_within_list_quota, on: :create

  private

  def board_within_list_quota
    return unless board && board.lists.active.count >= Limits[:lists_per_board]

    errors.add(:base, :quota_exceeded, limit: Limits[:lists_per_board])
  end
end
