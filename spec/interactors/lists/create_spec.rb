require 'rails_helper'

RSpec.describe Lists::Create do
  let(:board) { create(:board) }

  it "appends the list at the end of the board" do
    create(:list, board: board, position: 5000)

    list = described_class.call(board: board, attributes: { title: "Revisão" }).value

    expect(list.position).to eq(5000 + Positioned::STEP)
  end

  it "fails on a blank title" do
    expect(described_class.call(board: board, attributes: { title: "" })).to be_failure
  end
end
