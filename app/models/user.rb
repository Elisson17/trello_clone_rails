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
  has_many :board_memberships, dependent: :destroy
  has_many :boards, through: :board_memberships
  has_many :card_assignments, dependent: :destroy
  has_many :assigned_cards, through: :card_assignments, source: :card
  has_many :comments, dependent: :destroy
  has_many :activities, dependent: :destroy
  has_many :notifications, dependent: :destroy
  has_many :board_visits, dependent: :delete_all
  has_many :sent_invitations, class_name: "Invitation", foreign_key: :invited_by_id, dependent: :destroy,
           inverse_of: :invited_by

  validates :name, presence: true, length: { maximum: 80 }
  validates :time_zone, inclusion: { in: ActiveSupport::TimeZone::MAPPING.values }
  validate :avatar_must_be_a_small_image

  # O front só precisa do caminho, e presenter não tem `url_for` de controller à mão.
  def avatar_url
    return nil unless avatar.attached?

    Rails.application.routes.url_helpers.rails_blob_path(avatar, only_path: true)
  end

  private

  # Allowlist na mão: uma gem inteira (active_storage_validations) para duas linhas não se paga.
  def avatar_must_be_a_small_image
    return unless avatar.attached?

    errors.add(:avatar, :invalid_image) unless AVATAR_CONTENT_TYPES.include?(avatar.blob.content_type)
    errors.add(:avatar, :too_big) if avatar.blob.byte_size > AVATAR_MAX_SIZE
  end
end
