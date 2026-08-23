class Label < ApplicationRecord
  belongs_to :board

  has_many :card_labels, dependent: :destroy
  has_many :cards, through: :card_labels

  validates :name, presence: true, length: { maximum: 40 },
            uniqueness: { scope: :board_id, case_sensitive: false }
  # A mesma paleta do fundo do board: o front já sabe pintar esses seis tokens.
  validates :color, inclusion: { in: Board::BACKGROUNDS }
end
