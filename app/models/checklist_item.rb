class ChecklistItem < ApplicationRecord
  include Positioned

  belongs_to :checklist

  validates :content, presence: true, length: { maximum: 200 }

  def completed? = completed_at.present?
end
