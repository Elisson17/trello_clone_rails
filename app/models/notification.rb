class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :activity

  scope :unread, -> { where(read_at: nil) }
  scope :recent, -> { order(created_at: :desc, id: :desc) }

  def read? = read_at.present?
end
