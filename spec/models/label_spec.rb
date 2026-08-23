require 'rails_helper'

RSpec.describe Label, type: :model do
  it { is_expected.to belong_to(:board) }

  it "refuses a color outside the board palette" do
    expect(build(:label, color: "#ff0000")).to be_invalid
  end

  it "refuses two labels with the same name on one board" do
    board = create(:board)
    create(:label, board: board, name: "bug")

    expect(build(:label, board: board, name: "bug")).to be_invalid
  end

  it "allows the same name on another board" do
    create(:label, board: create(:board), name: "bug")

    expect(build(:label, board: create(:board), name: "bug")).to be_valid
  end
end
