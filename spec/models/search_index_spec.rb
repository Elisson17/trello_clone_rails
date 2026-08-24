require 'rails_helper'

RSpec.describe SearchIndex do
  it "indexes a card on creation" do
    card = create(:card, title: "Revisar contrato")

    expect(described_class.match("revisar", type: "Card")).to eq([ card.id ])
  end

  it "indexes a board on creation" do
    board = create(:board, title: "Lançamento")

    expect(described_class.match("lanç", type: "Board")).to eq([ board.id ])
  end

  it "matches by word prefix" do
    card = create(:card, title: "Configurar deploy")

    expect(described_class.match("conf", type: "Card")).to eq([ card.id ])
  end

  it "ignores accents" do
    card = create(:card, title: "Revisão de contrato")

    expect(described_class.match("revisao", type: "Card")).to eq([ card.id ])
  end

  it "does not match the middle of a word" do
    create(:card, title: "Configurar deploy")

    expect(described_class.match("figurar", type: "Card")).to be_empty
  end

  it "requires every word of the term" do
    create(:card, title: "Configurar deploy")

    expect(described_class.match("configurar banco", type: "Card")).to be_empty
  end

  it "follows a renamed title" do
    card = create(:card, title: "Titulo antigo")

    card.update!(title: "Titulo novo")

    expect(described_class.match("novo", type: "Card")).to eq([ card.id ])
  end

  it "drops the old title on rename" do
    card = create(:card, title: "Titulo antigo")

    card.update!(title: "Titulo novo")

    expect(described_class.match("antigo", type: "Card")).to be_empty
  end

  it "drops the row when the record is destroyed" do
    card = create(:card, title: "Some daqui")

    card.destroy!

    expect(described_class.match("some", type: "Card")).to be_empty
  end

  it "does not touch the index when another column changes" do
    card = create(:card, title: "Mesmo titulo")

    expect { card.update!(due_at: 1.day.from_now) }.not_to change(described_class, :count)
  end

  it "keeps board and card in separate result sets" do
    create(:card, title: "Palavra unica")

    expect(described_class.match("palavra", type: "Board")).to be_empty
  end

  it "returns nothing for a term with no words" do
    create(:card, title: "Qualquer coisa")

    expect(described_class.match("   ", type: "Card")).to be_empty
  end
end
