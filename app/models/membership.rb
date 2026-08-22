class Membership < ApplicationRecord
  belongs_to :workspace
  belongs_to :user

  enum :role, { owner: 0, admin: 1, member: 2 }, validate: true

  validates :user_id, uniqueness: { scope: :workspace_id }
  validate :workspace_keeps_an_owner, on: :update
  before_destroy :ensure_not_the_last_owner

  scope :ordered, -> { order(:role, :created_at) }

  def manages? = owner? || admin?

  # Único owner do workspace: não pode sair nem ser rebaixado (§3.3).
  def last_owner? = owner? && workspace.memberships.owner.where.not(id: id).none?

  private

  # O último owner não pode ser rebaixado (§3.3).
  def workspace_keeps_an_owner
    return unless role_changed?(from: "owner")

    errors.add(:role, :last_owner) if workspace.memberships.owner.where.not(id: id).none?
  end

  # Nem sair do workspace — a não ser que o workspace inteiro esteja indo embora.
  def ensure_not_the_last_owner
    return if destroyed_by_association
    return unless last_owner?

    errors.add(:base, :last_owner)
    throw :abort
  end
end
