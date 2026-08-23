require 'rails_helper'

RSpec.describe CardLabel, type: :model do
  let(:board) { create(:board) }
  let(:card) { create(:card, list: create(:list, board: board)) }

  it "links a label of the same board" do
    expect(build(:card_label, card: card, label: create(:label, board: board))).to be_valid
  end

  # Sem esta validação, um id forjado cola no card a label de outro board.
  it "refuses a label from another board" do
    expect(build(:card_label, card: card, label: create(:label))).to be_invalid
  end

  it "refuses the same label twice on one card" do
    label = create(:label, board: board)
    create(:card_label, card: card, label: label)

    expect(build(:card_label, card: card, label: label)).to be_invalid
  end
end
