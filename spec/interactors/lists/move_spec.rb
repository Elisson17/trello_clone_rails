require 'rails_helper'

RSpec.describe Lists::Move do
  let(:board) { create(:board) }

  def titles = board.lists.active.ordered.pluck(:title)

  it "reorders the lists of the board" do
    a = create(:list, board: board, title: "A", position: 1024)
    create(:list, board: board, title: "B", position: 2048)
    create(:list, board: board, title: "C", position: 3072)

    described_class.call(list: a, index: 1)

    expect(titles).to eq(%w[B A C])
  end

  it "moves a list to the front" do
    create(:list, board: board, title: "A", position: 1024)
    c = create(:list, board: board, title: "C", position: 3072)

    described_class.call(list: c, index: 0)

    expect(titles).to eq(%w[C A])
  end

  # O segundo `UPDATE`, em `boards`, é o `touch` que invalida o cache do payload (§9).
  it "spends a single UPDATE on lists" do
    create(:list, board: board, position: 1024)
    list = create(:list, board: board, position: 2048)

    assert_queries_match(/^UPDATE "lists"/i, count: 1) { described_class.call(list: list, index: 0) }
  end

  it "enqueues a rebalance when the neighbours get too close" do
    create(:list, board: board, position: 1024)
    create(:list, board: board, position: 1024.0000001)
    list = create(:list, board: board, position: 4096)

    expect { described_class.call(list: list, index: 1) }
      .to have_enqueued_job(RebalancePositionsJob).with(board, "lists")
  end
end
