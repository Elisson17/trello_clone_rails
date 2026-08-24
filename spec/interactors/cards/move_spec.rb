require 'rails_helper'

RSpec.describe Cards::Move do
  let(:board) { create(:board) }
  let(:list) { create(:list, board: board) }

  def titles(of) = of.cards.active.ordered.pluck(:title)

  it "reorders inside the same list" do
    a = create(:card, list: list, title: "A", position: 1024)
    create(:card, list: list, title: "B", position: 2048)
    create(:card, list: list, title: "C", position: 3072)

    described_class.call(card: a, list: list, index: 2)

    expect(titles(list)).to eq(%w[B C A])
  end

  it "moves the card to another list of the same board" do
    other = create(:list, board: board, position: 2048)
    card = create(:card, list: list, title: "A")
    create(:card, list: other, title: "B", position: 1024)

    described_class.call(card: card, list: other, index: 0)

    expect(titles(other)).to eq(%w[A B])
    expect(titles(list)).to be_empty
  end

  it "refuses a list from another board" do
    card = create(:card, list: list)
    foreign = create(:list)

    result = described_class.call(card: card, list: foreign, index: 0)

    expect(result).to be_failure
    expect(card.reload.list).to eq(list)
  end

  it "clamps an index past the end instead of blowing up" do
    create(:card, list: list, title: "A", position: 1024)
    b = create(:card, list: list, title: "B", position: 2048)

    described_class.call(card: b, list: list, index: 99)

    expect(titles(list)).to eq(%w[A B])
  end

  it "ignores archived cards when picking the neighbours" do
    create(:card, :archived, list: list, position: 512)
    a = create(:card, list: list, title: "A", position: 1024)
    create(:card, list: list, title: "B", position: 2048)

    described_class.call(card: a, list: list, index: 1)

    expect(titles(list)).to eq(%w[B A])
  end

  # Mover é reescrever a posição de um card, nunca renumerar a coluna. Os `UPDATE` de
  # `lists` e `boards` que vêm depois são o `touch` que invalida o cache do board (§9).
  it "spends a single UPDATE on cards when the card stays in its list" do
    create(:card, list: list, position: 1024)
    card = create(:card, list: list, position: 2048)

    assert_queries_match(/^UPDATE "cards"/i, count: 1) { described_class.call(card: card, list: list, index: 0) }
  end

  it "enqueues a rebalance when the neighbours get too close" do
    create(:card, list: list, position: 1024)
    create(:card, list: list, position: 1024.0000001)
    card = create(:card, list: list, position: 4096)

    expect { described_class.call(card: card, list: list, index: 1) }
      .to have_enqueued_job(RebalancePositionsJob).with(list, "cards")
  end

  it "leaves the rebalance alone while there is room between neighbours" do
    create(:card, list: list, position: 1024)
    create(:card, list: list, position: 2048)
    card = create(:card, list: list, position: 4096)

    expect { described_class.call(card: card, list: list, index: 1) }
      .not_to have_enqueued_job(RebalancePositionsJob)
  end
end
