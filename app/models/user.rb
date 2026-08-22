class User < ApplicationRecord
  AVATAR_CONTENT_TYPES = %w[image/png image/jpeg image/webp].freeze
  AVATAR_MAX_SIZE = 2.megabytes

  devise :database_authenticatable, :registerable, :recoverable,
         :rememberable, :validatable, :confirmable, :trackable

  has_one_attached :avatar

  has_many :memberships, dependent: :destroy
  has_many :workspaces, through: :memberships
  has_many :owned_workspaces, class_name: "Workspace", foreign_key: :owner_id, dependent: :destroy,
           inverse_of: :owner
  has_many :sent_invitations, class_name: "Invitation", foreign_key: :invited_by_id, dependent: :destroy,
           inverse_of: :invited_by

  validates :name, presence: true, length: { maximum: 80 }
  validates :time_zone, inclusion: { in: ActiveSupport::TimeZone::MAPPING.values }
  validate :avatar_must_be_a_small_image

  private

  # Allowlist na mão: uma gem inteira (active_storage_validations) para duas linhas não se paga.
  def avatar_must_be_a_small_image
    return unless avatar.attached?

    errors.add(:avatar, :invalid_image) unless AVATAR_CONTENT_TYPES.include?(avatar.blob.content_type)
    errors.add(:avatar, :too_big) if avatar.blob.byte_size > AVATAR_MAX_SIZE
  end
end
