class RebalancePositionsJob < ApplicationJob
  queue_as :default

  def perform(owner, association)
    owner.public_send(association).rebalance_positions!
  end
end
