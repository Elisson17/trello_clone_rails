class Activity < ApplicationRecord
  belongs_to :board
  belongs_to :user, optional: true
  # `optional` sem coluna nula: o id continua obrigatório, mas a linha pode apontar para
  # um card que já foi apagado — `card.deleted` é exatamente esse caso, e o texto do feed
  # vem do `metadata`, não do registro.
  belongs_to :subject, polymorphic: true, optional: true
  has_many :notifications, dependent: :destroy

  validates :action, presence: true

  scope :recent, -> { order(created_at: :desc, id: :desc) }
  scope :about, ->(subject) { where(subject: subject) }
end
