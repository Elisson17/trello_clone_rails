require 'rails_helper'

RSpec.describe "Board members and duplication", type: :request do
  let(:workspace) { create(:workspace, :owned) }
  let(:user) { workspace.owner }
  let(:board) { create(:board, :with_admin, workspace: workspace, creator: user) }

  before { sign_in user }

  describe "memberships" do
    let(:colleague) { create(:user).tap { |u| create(:membership, workspace: workspace, user: u, role: :member) } }

    it "adds a workspace member to the board" do
      post board_memberships_path(board), params: { user_id: colleague.id }

      expect(board.reload.members).to include(colleague)
    end

    it "defaults the new membership to member" do
      post board_memberships_path(board), params: { user_id: colleague.id }

      expect(board.membership_for(colleague).role).to eq("member")
    end

    # Quem não é do workspace entra por convite, não por esta porta.
    it "refuses somebody from outside the workspace" do
      post board_memberships_path(board), params: { user_id: create(:user).id }

      expect(response).to have_http_status(:not_found)
    end

    it "changes a role" do
      membership = board.board_memberships.create!(user: colleague, role: :member)

      patch board_membership_path(board, membership), params: { role: "viewer" }

      expect(membership.reload.role).to eq("viewer")
    end

    it "removes a member" do
      membership = board.board_memberships.create!(user: colleague, role: :member)

      delete board_membership_path(board, membership)

      expect(board.reload.members).not_to include(colleague)
    end

    it "denies a plain member" do
      board.board_memberships.create!(user: colleague, role: :member)
      sign_in colleague

      post board_memberships_path(board), params: { user_id: create(:user).id }

      expect(response).to redirect_to(root_path)
    end

    it "sends the members in the board payload" do
      get board_path(board)

      expect(inertia_props(response)["board"]["members"].sole["user"]).to include("id" => user.id)
    end

    it "sends the workspace members the board is missing" do
      colleague

      get board_path(board)

      expect(inertia_props(response)["board"]["workspace_members"].pluck("id")).to include(colleague.id)
    end
  end

  describe "duplication" do
    it "lands on the copy" do
      post board_duplicate_path(board)

      expect(response).to redirect_to(board_path(Board.last))
    end

    it "creates the copy" do
      board

      expect { post board_duplicate_path(board) }.to change(Board, :count).by(1)
    end

    it "denies somebody who cannot create boards in the workspace" do
      sign_in create(:user)

      post board_duplicate_path(board)

      expect(response).to redirect_to(root_path)
    end
  end
end
