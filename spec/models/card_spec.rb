require 'rails_helper'

RSpec.describe Card, type: :model do
  it { is_expected.to belong_to(:list).counter_cache(:cards_count) }
  it { is_expected.to belong_to(:creator).class_name("User") }

  it "keeps cards_count in sync" do
    list = create(:list)

    expect { create(:card, list: list) }.to change { list.reload.cards_count }.by(1)
  end

  it "derives overdue from due_at without persisting it" do
    expect(build(:card, :overdue)).to be_overdue
  end

  it "is not overdue once completed" do
    expect(build(:card, :overdue, :completed)).not_to be_overdue
  end

  it "is not overdue without a due date" do
    expect(build(:card, due_at: nil)).not_to be_overdue
  end

  it "counts cards of the whole board against the quota" do
    board = create(:board)
    stub_const("Limits", Limits.merge(cards_per_board: 1))
    create(:card, list: create(:list, board: board))

    expect(build(:card, list: create(:list, board: board))).to be_invalid
  end
end
