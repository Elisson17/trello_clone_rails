require 'rails_helper'

RSpec.describe Board, type: :model do
  it { is_expected.to belong_to(:workspace) }
  it { is_expected.to belong_to(:creator).class_name("User") }
  it { is_expected.to have_many(:lists).dependent(:destroy) }
  it { is_expected.to define_enum_for(:visibility).with_values(private_to_members: 0, workspace_wide: 1) }

  it "refuses a background outside the allowlist" do
    expect(build(:board, background: "#ff0000")).to be_invalid
  end

  it "refuses more boards than the workspace quota" do
    workspace = create(:workspace)
    stub_const("Limits", Limits.merge(boards_per_workspace: 1))
    create(:board, workspace: workspace)

    expect(build(:board, workspace: workspace)).to be_invalid
  end

  it "does not count archived boards against the quota" do
    workspace = create(:workspace)
    stub_const("Limits", Limits.merge(boards_per_workspace: 1))
    create(:board, :archived, workspace: workspace)

    expect(build(:board, workspace: workspace)).to be_valid
  end

  it "archives and restores instead of deleting" do
    board = create(:board)

    board.archive!
    expect(described_class.active).not_to include(board)

    board.restore!
    expect(described_class.active).to include(board)
  end
end
