require 'rails_helper'

RSpec.describe RebalancePositionsJob do
  it "spreads the cards of a list back to multiples of the step" do
    list = create(:list)
    a = create(:card, list: list, position: 1024)
    b = create(:card, list: list, position: 1024.00000001)
    c = create(:card, list: list, position: 1024.00000002)

    described_class.perform_now(list, "cards")

    expect([ a, b, c ].map { |card| card.reload.position }).to eq([ 1024, 2048, 3072 ])
  end

  it "keeps archived records in the sequence, so restoring one lands somewhere sane" do
    list = create(:list)
    create(:card, list: list, position: 1024)
    archived = create(:card, :archived, list: list, position: 1024.5)
    last = create(:card, list: list, position: 2048)

    described_class.perform_now(list, "cards")

    expect(archived.reload.position).to eq(2048)
    expect(last.reload.position).to eq(3072)
  end

  it "spreads the lists of a board" do
    board = create(:board)
    first = create(:list, board: board, position: 1)
    second = create(:list, board: board, position: 2)

    described_class.perform_now(board, "lists")

    expect([ first.reload.position, second.reload.position ]).to eq([ 1024, 2048 ])
  end
end
