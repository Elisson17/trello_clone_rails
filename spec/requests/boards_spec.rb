require 'rails_helper'

RSpec.describe "Boards", type: :request do
  let(:workspace) { create(:workspace, :owned) }
  let(:user) { workspace.owner }
  let(:board) { create(:board, :with_admin, workspace: workspace, creator: user) }

  before { sign_in user }

  describe "creating" do
    it "creates a board with the three default lists and lands on it" do
      post workspace_boards_path(workspace), params: { title: "Roadmap" }

      board = Board.sole
      expect(response).to redirect_to(board_path(board))
      expect(board.lists.ordered.pluck(:title)).to eq(Board::DEFAULT_LISTS)
      expect(board.membership_for(user)).to be_admin
    end

    it "returns errors for a blank title" do
      post workspace_boards_path(workspace), params: { title: "" }

      expect(session[:inertia_errors]).to have_key(:title)
    end

    it "denies someone outside the workspace" do
      sign_in create(:user)

      post workspace_boards_path(workspace), params: { title: "Roadmap" }

      expect(Board.count).to be_zero
    end
  end

  describe "showing" do
    it "renders the board with its lists and cards" do
      list = create(:list, board: board, title: "A fazer")
      create(:card, list: list, title: "Primeiro card")

      get board_path(board)

      payload = inertia_props(response)["board"]
      expect(payload["lists"].sole["title"]).to eq("A fazer")
      expect(payload["lists"].sole["cards"].sole["title"]).to eq("Primeiro card")
    end

    it "sends the effective permissions so the front can hide what the back blocks" do
      get board_path(board)

      expect(inertia_props(response)["can"]).to include("update" => true, "destroy" => true)
    end

    it "hides a private board from a workspace member who is not on it" do
      other = create(:membership, workspace: workspace, user: create(:user), role: :member)
      private_board = create(:board, :private_board, workspace: workspace)
      sign_in other.user

      get board_path(private_board)

      expect(response).to redirect_to(root_path)
    end

    it "records the visit" do
      get board_path(board)

      expect(BoardVisit.sole).to have_attributes(user_id: user.id, board_id: board.id)
    end

    it "moves the same row instead of piling rows up" do
      get board_path(board)
      first = BoardVisit.sole.viewed_at

      travel 1.minute
      get board_path(board)

      expect(BoardVisit.count).to eq(1)
      expect(BoardVisit.sole.viewed_at).to be > first
    end

    it "records nothing when the board is not visible to the person" do
      sign_in create(:user)

      get board_path(board)

      expect(BoardVisit.count).to be_zero
    end

    # O payload não faz uma query por lista nem por card.
    it "loads a full board without a single N+1" do
      big = create(:board, :with_admin, workspace: workspace, creator: user)
      create_list(:list, 5, board: big).each { |list| create_list(:card, 10, list: list) }

      expect_no_n_plus_one { get board_path(big) }

      expect(response).to have_http_status(:ok)
    end
  end

  describe "editing" do
    it "renames the board" do
      patch board_path(board), params: { title: "Novo título" }

      expect(board.reload.title).to eq("Novo título")
    end

    it "refuses a background outside the allowlist" do
      patch board_path(board), params: { background: "#ff0000" }

      expect(session[:inertia_errors]).to have_key(:background)
    end

    it "denies a viewer" do
      viewer = create(:membership, workspace: workspace, user: create(:user), role: :member)
      create(:board_membership, board: board, user: viewer.user, role: :viewer)
      sign_in viewer.user

      patch board_path(board), params: { title: "Hackeado" }

      expect(board.reload.title).not_to eq("Hackeado")
    end
  end

  describe "archiving" do
    it "archives instead of deleting" do
      post board_archive_path(board)

      expect(board.reload).to be_archived
      expect(Board.exists?(board.id)).to be(true)
    end

    it "restores" do
      board.archive!

      delete board_archive_path(board)

      expect(board.reload).not_to be_archived
    end

    it "leaves the board out of the workspace page once archived" do
      board.archive!

      get workspace_path(workspace)

      expect(inertia_props(response)["boards"]).to be_empty
      expect(inertia_props(response)["archived_count"]).to eq(1)
    end
  end

  it "deletes for real only for the board admin" do
    delete board_path(board)

    expect(Board.exists?(board.id)).to be(false)
  end
end
