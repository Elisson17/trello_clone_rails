require 'rails_helper'

RSpec.describe BoardPolicy do
  let(:workspace) { create(:workspace, :owned) }
  let(:user) { create(:user) }

  def workspace_member(role) = workspace.memberships.create!(user: user, role: role)
  def board_member(board, role) = board.board_memberships.create!(user: user, role: role)

  describe "a private board" do
    let(:board) { create(:board, :private_board, workspace: workspace) }

    it "hides itself from a workspace member who is not on the board" do
      workspace_member(:member)

      expect(described_class.new(user, board)).not_to be_show
    end

    it "shows itself to an explicit board member" do
      workspace_member(:member)
      board_member(board, :viewer)

      expect(described_class.new(user, board)).to be_show
    end

    it "still answers to whoever manages the workspace" do
      workspace_member(:admin)

      expect(described_class.new(user, board)).to be_update
    end
  end

  describe "a workspace-wide board" do
    let(:board) { create(:board, workspace: workspace) }

    it "shows itself to any workspace member" do
      workspace_member(:member)

      expect(described_class.new(user, board)).to be_show
    end

    it "hides itself from someone outside the workspace" do
      expect(described_class.new(user, board)).not_to be_show
    end
  end

  describe "write permissions" do
    let(:board) { create(:board, workspace: workspace) }

    before { workspace_member(:member) }

    it "lets a board admin destroy it" do
      board_member(board, :admin)

      expect(described_class.new(user, board)).to be_destroy
    end

    it "lets a board member edit but not destroy" do
      board_member(board, :member)
      policy = described_class.new(user, board)

      expect(policy).to be_update
      expect(policy).not_to be_destroy
    end

    it "denies a viewer any write" do
      board_member(board, :viewer)
      policy = described_class.new(user, board)

      expect(policy).to be_show
      expect(policy).not_to be_update
      expect(policy).not_to be_manage_cards
    end

    it "denies a workspace member with no board role" do
      expect(described_class.new(user, board)).not_to be_update
    end
  end

  describe "Scope" do
    it "returns workspace-wide boards of my workspaces plus boards I am on" do
      workspace_member(:member)
      wide = create(:board, workspace: workspace)
      mine = create(:board, :private_board, workspace: workspace)
      board_member(mine, :viewer)
      create(:board, :private_board, workspace: workspace)
      create(:board, workspace: create(:workspace))

      expect(described_class::Scope.new(user, Board).resolve).to contain_exactly(wide, mine)
    end
  end
end
