class Workspace < ApplicationRecord
  MAX_PER_USER = 50

  belongs_to :owner, class_name: "User"
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships
  has_many :invitations, dependent: :destroy

  validates :name, presence: true, length: { maximum: 80 }
  validates :slug, presence: true, uniqueness: true
  validate :owner_within_workspace_quota, on: :create

  before_validation :assign_slug, on: :create

  scope :ordered, -> { order(personal: :desc, name: :asc) }

  def to_param = slug

  def membership_for(user) = memberships.find_by(user: user)

  private

  # Slug único sem gem: parameterize e, se colidir, sufixo numérico.
  def assign_slug
    return if slug.present?

    base = name.to_s.parameterize.presence || "workspace"
    candidate = base
    candidate = "#{base}-#{SecureRandom.hex(3)}" while Workspace.exists?(slug: candidate)
    self.slug = candidate
  end

  def owner_within_workspace_quota
    return unless owner && owner.owned_workspaces.count >= MAX_PER_USER

    errors.add(:base, :quota_exceeded)
  end
end
