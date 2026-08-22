
module Positioned
  extend ActiveSupport::Concern

  STEP = 1024

  included do
    validates :position, presence: true, numericality: true

    scope :ordered, -> { order(:position, :id) }
  end

  class_methods do
    def next_position = (maximum(:position) || 0) + STEP
  end
end
