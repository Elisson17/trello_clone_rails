class Activity < ApplicationRecord
  belongs_to :board
  belongs_to :user, optional: true
  # `optional` sem coluna nula: o id continua obrigatório, mas pode apontar para um card
  # já apagado (`card.deleted`). O texto do feed vem do `metadata`.
  belongs_to :subject, polymorphic: true, optional: true
  has_many :notifications, dependent: :destroy

  validates :action, presence: true

  scope :recent, -> { order(created_at: :desc, id: :desc) }
  scope :about, ->(subject) { where(subject: subject) }
end
