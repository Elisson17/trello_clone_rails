class Checklist < ApplicationRecord
  include Positioned

  belongs_to :card, touch: true

  has_many :items, -> { ordered }, class_name: "ChecklistItem", dependent: :destroy,
           inverse_of: :checklist

  validates :title, presence: true, length: { maximum: 120 }
end
