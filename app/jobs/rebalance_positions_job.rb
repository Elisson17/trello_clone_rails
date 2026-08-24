class RebalancePositionsJob < ApplicationJob
  queue_as :default

  def perform(owner, association)
    owner.public_send(association).rebalance_positions!

    # `rebalance_positions!` usa `update_column`, que não dispara `touch` — sem isto o
    # payload cacheado do board ficaria com as posições antigas.
    owner.touch
  end
end
