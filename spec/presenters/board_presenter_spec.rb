require 'rails_helper'

RSpec.describe BoardPresenter do
  let(:board) { create(:board, title: "Roadmap") }

  def payload = described_class.new(board.reload).as_json

  it "nests the cards inside their list, in position order" do
    list = create(:list, board: board, position: 1024)
    second = create(:card, list: list, position: 2048, title: "Segundo")
    first = create(:card, list: list, position: 1024, title: "Primeiro")

    titles = payload[:lists].sole[:cards].pluck(:title)

    expect(titles).to eq([ first.title, second.title ])
    expect(titles).to eq([ "Primeiro", "Segundo" ])
  end

  it "leaves archived lists and cards out" do
    live = create(:list, board: board)
    create(:list, :archived, board: board)
    create(:card, :archived, list: live)

    expect(payload[:lists].size).to eq(1)
    expect(payload[:lists].sole[:cards]).to be_empty
  end

  it "exposes overdue as derived state" do
    card = create(:card, :overdue, list: create(:list, board: board))

    expect(payload[:lists].sole[:cards].sole).to include(id: card.id, overdue: true)
  end

  # Duas camadas: o Bullet pega o N+1 clássico e o contador nativo prende o número exato,
  # inclusive contra leitura de associação com escopo, que o Bullet não enxerga.
  it "builds the payload without a single N+1" do
    big = create(:board)
    create_list(:list, 5, board: big).each { |list| create_list(:card, 10, list: list) }

    expect_no_n_plus_one { described_class.new(Board.find(big.id)).as_json }
  end

  # O número importa menos do que ele ser fixo: cada badge do card custa uma query de
  # eager load, e nenhuma cresce com o tamanho do board. Se subir junto, é N+1 de volta.
  it "costs the same ten queries no matter how big the board is" do
    big = create(:board)
    create_list(:list, 5, board: big).each { |list| create_list(:card, 10, list: list) }
    board = Board.find(big.id)

    assert_queries_count(10) { described_class.new(board).as_json }
  end

  it "keeps that query count when the board is ten times bigger" do
    big = create(:board)
    create_list(:list, 5, board: big).each { |list| create_list(:card, 100, list: list) }
    board = Board.find(big.id)

    assert_queries_count(10) { described_class.new(board).as_json }
  end
end
