# Último acesso da pessoa a um board: uma linha por par, atualizada por `upsert` no
# `BoardsController#show`. Nunca `touch` no board — ver `BoardRendering`.
class BoardVisit < ApplicationRecord
  belongs_to :user
  belongs_to :board

  validates :viewed_at, presence: true
  validates :user_id, uniqueness: { scope: :board_id }
end
