class BoardMembership < ApplicationRecord
  belongs_to :board, touch: true
  belongs_to :user

  enum :role, { admin: 0, member: 1, viewer: 2 }, validate: true

  validates :user_id, uniqueness: { scope: :board_id }

  def writes? = admin? || member?
end
