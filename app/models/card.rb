class Card < ApplicationRecord
  include Positioned
  include Archivable
  include Searchable

  # Allowlist de anexo: imagem, PDF e texto. Nada executável, nada de arquivo comprimido —
  # é um demo público, o upload é a porta de entrada mais barata que existe.
  ATTACHMENT_CONTENT_TYPES = %w[
    image/png image/jpeg image/webp image/gif application/pdf text/plain text/csv text/markdown
  ].freeze

  belongs_to :list, counter_cache: :cards_count, touch: true
  belongs_to :creator, class_name: "User"

  has_one :board, through: :list

  has_many :card_labels, dependent: :destroy
  has_many :labels, through: :card_labels
  has_many :card_assignments, dependent: :destroy
  has_many :assignees, through: :card_assignments, source: :user
  has_many :checklists, -> { ordered }, dependent: :destroy, inverse_of: :card
  has_many :comments, dependent: :destroy
  has_many_attached :attachments

  validates :title, presence: true, length: { maximum: 200 }
  validates :description, length: { maximum: 10_000 }
  validates :cover_color, inclusion: { in: Board::BACKGROUNDS }, allow_nil: true
  validate :board_within_card_quota, on: :create
  validate :attachments_within_allowlist_and_quota

  scope :overdue, -> { where(completed_at: nil).where(due_at: ...Time.current) }

  def completed? = completed_at.present?

  # Derivado, nunca persistido (§3.5).
  def overdue? = due_at.present? && completed_at.nil? && due_at.past?

  private

  def board_within_card_quota
    return unless list && list.board.cards.active.count >= Limits[:cards_per_board]

    errors.add(:base, :quota_exceeded, limit: Limits[:cards_per_board])
  end

  # Mesma escolha do avatar do User: allowlist na mão em vez de mais uma gem.
  def attachments_within_allowlist_and_quota
    return unless attachments.attached?

    errors.add(:attachments, :too_many, limit: Limits[:attachments_per_card]) if attachments.size > Limits[:attachments_per_card]

    attachments.each do |attachment|
      errors.add(:attachments, :invalid_type) unless ATTACHMENT_CONTENT_TYPES.include?(attachment.blob.content_type)
      errors.add(:attachments, :too_big, limit: Limits[:attachment_megabytes]) if attachment.blob.byte_size > Limits[:attachment_megabytes].megabytes
    end
  end
end
