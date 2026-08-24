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

    # Roda em job, e nenhuma validação ou callback depende de posição: `update_column` basta.
    def rebalance_positions!
      transaction do
        ordered.each.with_index(1) { |record, index| record.update_column(:position, index * STEP) }
      end
    end
  end

  def crowded?(neighbor) = neighbor.present? && (position - neighbor.position).abs < MIN_GAP
end
