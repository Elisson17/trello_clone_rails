require 'rails_helper'

RSpec.describe CardAssignment, type: :model do
  let(:board) { create(:board) }
  let(:card) { create(:card, list: create(:list, board: board)) }

  it "assigns a member of the board" do
    user = create(:user)
    board.board_memberships.create!(user: user, role: :member)

    expect(build(:card_assignment, card: card, user: user)).to be_valid
  end

  it "refuses somebody who is not a member of the board" do
    expect(build(:card_assignment, card: card, user: create(:user))).to be_invalid
  end
end
