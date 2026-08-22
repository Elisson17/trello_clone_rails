require 'rails_helper'

RSpec.describe Positioned do
  let(:board) { create(:board) }

  it "starts at STEP when the scope is empty" do
    expect(board.lists.next_position).to eq(Positioned::STEP)
  end

  it "puts the next record a full STEP after the last one" do
    create(:list, board: board, position: 3072)

    expect(board.lists.next_position).to eq(3072 + Positioned::STEP)
  end

  it "orders by position and breaks ties by id" do
    third = create(:list, board: board, position: 3000)
    first = create(:list, board: board, position: 1000)
    second = create(:list, board: board, position: 2000)

    expect(board.lists.ordered).to eq([ first, second, third ])
  end

  it "keeps eight decimal places, which is what makes the halving work" do
    list = create(:list, board: board, position: BigDecimal("1024.00000001"))

    expect(list.reload.position).to eq(BigDecimal("1024.00000001"))
  end
end
