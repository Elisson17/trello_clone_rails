require 'rails_helper'

RSpec.describe Boards::Create do
  let(:workspace) { create(:workspace, :owned) }
  let(:creator) { workspace.owner }

  def create_board(**options)
    described_class.call(workspace: workspace, creator: creator,
                         attributes: { title: "Board novo" }, **options)
  end

  it "creates the board with the creator as board admin" do
    board = create_board.value

    expect(board.membership_for(creator)).to be_admin
  end

  it "creates the three default lists in order" do
    board = create_board.value

    expect(board.lists.ordered.pluck(:title)).to eq(Board::DEFAULT_LISTS)
  end

  it "can skip the default lists" do
    board = create_board(with_default_lists: false).value

    expect(board.lists).to be_empty
  end

  it "puts each board a STEP after the last one" do
    first = create_board.value
    second = create_board.value

    expect(second.position - first.position).to eq(Positioned::STEP)
  end

  it "creates nothing when the board is invalid" do
    result = described_class.call(workspace: workspace, creator: creator, attributes: { title: "" })

    expect(result).to be_failure
    expect(Board.count).to be_zero
    expect(List.count).to be_zero
  end
end
