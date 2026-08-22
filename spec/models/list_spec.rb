require 'rails_helper'

RSpec.describe List, type: :model do
  it { is_expected.to belong_to(:board).counter_cache(:lists_count) }
  it { is_expected.to have_many(:cards).dependent(:destroy) }

  it "keeps lists_count in sync" do
    board = create(:board)

    expect { create(:list, board: board) }.to change { board.reload.lists_count }.by(1)
  end

  it "refuses more lists than the board quota" do
    board = create(:board)
    stub_const("Limits", Limits.merge(lists_per_board: 1))
    create(:list, board: board)

    expect(build(:list, board: board)).to be_invalid
  end
end
