class User < ApplicationRecord
  AVATAR_CONTENT_TYPES = %w[image/png image/jpeg image/webp].freeze
  AVATAR_MAX_SIZE = 2.megabytes
  # Discos prontos em `app/assets/images/avatars`: 12 matizes a 30° de distância na roda
  # OKLCH, a mesma escala de `lib/accent.ts`. Quem não quer subir foto escolhe um destes.
  AVATAR_PRESETS = %w[vermelho laranja ambar dourado oliva verde turquesa celeste azul indigo violeta rosa].freeze

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
  validates :avatar_preset, inclusion: { in: AVATAR_PRESETS }, allow_blank: true
  validate :avatar_must_be_a_small_image

  # Foto e disco pronto respondem à mesma pergunta: guardar os dois deixaria a resposta
  # ambígua para o `avatar_url`. Quem chegou por último manda.
  before_save :settle_the_avatar

  # O front só precisa do caminho, e presenter não tem `url_for` de controller à mão.
  # Preset e upload saem pela mesma porta: nenhum consumidor de avatar precisa saber
  # qual dos dois a pessoa escolheu.
  def avatar_url
    return ActionController::Base.helpers.image_path("avatars/#{avatar_preset}.svg") if avatar_preset.present?
    return nil unless avatar.attached?

    Rails.application.routes.url_helpers.rails_blob_path(avatar, only_path: true)
  end

  private

  def settle_the_avatar
    return self.avatar_preset = nil if attachment_changes["avatar"]
    return unless avatar_preset_changed?

    # Trocar de disco — ou escolher "sem avatar" — descarta a foto que estava lá.
    avatar.purge_later if avatar.attached?
    self.avatar_preset = nil if avatar_preset.blank?
  end

  # Allowlist na mão: uma gem inteira (active_storage_validations) para duas linhas não se paga.
  def avatar_must_be_a_small_image
    return unless avatar.attached?

    errors.add(:avatar, :invalid_image) unless AVATAR_CONTENT_TYPES.include?(avatar.blob.content_type)
    errors.add(:avatar, :too_big) if avatar.blob.byte_size > AVATAR_MAX_SIZE
  end
end
