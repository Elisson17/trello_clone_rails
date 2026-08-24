class Comment < ApplicationRecord
  # O autor edita por 15 min; depois disso, só apagar.
  EDIT_WINDOW = 15.minutes

  belongs_to :card, counter_cache: :comments_count, touch: true
  belongs_to :user

  validates :body, presence: true, length: { maximum: 5_000 }

  scope :chronological, -> { order(:created_at, :id) }

  def edited? = edited_at.present?

  def editable_by?(other) = other == user && created_at > EDIT_WINDOW.ago
end
