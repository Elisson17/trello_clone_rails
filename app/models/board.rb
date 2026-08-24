class Board < ApplicationRecord
  include Positioned
  include Archivable
  include Searchable

  DEFAULT_LISTS = [ "A fazer", "Fazendo", "Feito" ].freeze
  BACKGROUNDS = %w[slate rose amber emerald sky violet].freeze

  # `updated_at` do board é a chave do cache do payload: tudo que aparece na tela do board
  # tem `touch: true` subindo até aqui (lista, card, comentário, checklist, item, etiqueta,
  # responsável, membro). O preço é marcar um item de checklist pagar 4 UPDATEs.
  belongs_to :workspace
  belongs_to :creator, class_name: "User"

  has_many :board_memberships, dependent: :destroy
  has_many :members, through: :board_memberships, source: :user
  has_many :lists, dependent: :destroy
  has_many :labels, dependent: :destroy
  has_many :cards, through: :lists
  has_many :activities, dependent: :destroy
  has_many :board_visits, dependent: :delete_all

  enum :visibility, { private_to_members: 0, workspace_wide: 1 }, validate: true

  validates :title, presence: true, length: { maximum: 120 }
  validates :description, length: { maximum: 2_000 }
  validates :background, inclusion: { in: BACKGROUNDS }
  validate :workspace_within_board_quota, on: :create

  def membership_for(user) = board_memberships.find_by(user: user)

  private

  def workspace_within_board_quota
    return unless workspace && workspace.boards.active.count >= Limits[:boards_per_workspace]

    errors.add(:base, :quota_exceeded, limit: Limits[:boards_per_workspace])
  end
end
