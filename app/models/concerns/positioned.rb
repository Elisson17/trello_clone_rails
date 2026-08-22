module Positioned
  extend ActiveSupport::Concern

  STEP = 1024

  MIN_GAP = 0.001

  included do
    validates :position, presence: true, numericality: true

    scope :ordered, -> { order(:position, :id) }
  end

  class_methods do
    def next_position = (maximum(:position) || 0) + STEP

    # Posição entre dois vizinhos. Sem vizinho anterior o item vai para antes do primeiro;
    # sem posterior, para depois do último; sem nenhum dos dois, é o primeiro da coleção.
    def position_between(before, after)
      return STEP if before.nil? && after.nil?
      return after - STEP if before.nil?
      return before + STEP if after.nil?

      (before + after) / 2
    end

    # Redistribui as posições em múltiplos de STEP. Roda em job, então `update_column`
    # basta: não há validação nem callback que dependa de posição.
    def rebalance_positions!
      transaction do
        ordered.each.with_index(1) { |record, index| record.update_column(:position, index * STEP) }
      end
    end
  end

  # Cabe mais alguém entre este item e o vizinho? Se não, alguém precisa rebalancear.
  def crowded?(neighbor) = neighbor.present? && (position - neighbor.position).abs < MIN_GAP
end
