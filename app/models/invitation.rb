class Invitation < ApplicationRecord
  EXPIRES_IN = 7.days

  belongs_to :workspace
  belongs_to :invited_by, class_name: "User"

  has_secure_token :token, length: 32

  enum :role, { owner: 0, admin: 1, member: 2 }, validate: true

  normalizes :email_address, with: ->(value) { value.to_s.strip.downcase }

  validates :email_address, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :email_address, uniqueness: { scope: :workspace_id, conditions: -> { pending } }
  validate :invitee_is_not_a_member, on: :create

  before_validation :set_expiry, on: :create

  scope :pending, -> { where(accepted_at: nil) }

  def accepted? = accepted_at.present?
  def expired? = expires_at.past?
  def usable? = !accepted? && !expired?

  def user = User.find_by(email: email_address)

  private

  def set_expiry
    self.expires_at ||= EXPIRES_IN.from_now
  end

  def invitee_is_not_a_member
    return unless workspace && User.joins(:memberships)
                                   .exists?(email: email_address, memberships: { workspace_id: workspace_id })

    errors.add(:email_address, :already_member)
  end
end
