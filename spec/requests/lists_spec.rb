require 'rails_helper'

RSpec.describe "Lists", type: :request do
  let(:workspace) { create(:workspace, :owned) }
  let(:user) { workspace.owner }
  let(:board) { create(:board, :with_admin, workspace: workspace, creator: user) }

  before { sign_in user }

  it "appends a list to the end of the board" do
    create(:list, board: board, position: 4096)

    post board_lists_path(board), params: { title: "Revisão" }

    expect(board.lists.ordered.last).to have_attributes(title: "Revisão", position: 4096 + 1024)
  end

  it "returns errors for a blank title" do
    post board_lists_path(board), params: { title: "" }

    expect(session[:inertia_errors]).to have_key(:title)
  end

  it "renames a list" do
    list = create(:list, board: board)

    patch board_list_path(board, list), params: { title: "Fazendo agora" }

    expect(list.reload.title).to eq("Fazendo agora")
  end

  it "archives the list instead of deleting it" do
    list = create(:list, board: board)
    create(:card, list: list)

    delete board_list_path(board, list)

    expect(list.reload).to be_archived
    expect(List.exists?(list.id)).to be(true)
    expect(Card.count).to eq(1)
  end

  it "denies a viewer" do
    viewer = create(:membership, workspace: workspace, user: create(:user), role: :member)
    create(:board_membership, board: board, user: viewer.user, role: :viewer)
    sign_in viewer.user

    post board_lists_path(board), params: { title: "Nada" }

    expect(board.lists).to be_empty
  end
end
