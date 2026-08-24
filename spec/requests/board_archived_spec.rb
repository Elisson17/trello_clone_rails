require 'rails_helper'

RSpec.describe "Board archived panel", type: :request do
  let(:workspace) { create(:workspace, :owned) }
  let(:user) { workspace.owner }
  let(:board) { create(:board, :with_admin, workspace: workspace, creator: user) }

  before { sign_in user }

  it "lists the archived lists of the board" do
    list = create(:list, :archived, board: board)

    get board_archived_path(board)

    expect(inertia_props(response)["lists"].map { |item| item["id"] }).to eq([ list.id ])
  end

  it "leaves the active lists out" do
    create(:list, board: board)

    get board_archived_path(board)

    expect(inertia_props(response)["lists"]).to be_empty
  end

  it "lists the archived cards of the board" do
    card = create(:card, :archived, list: create(:list, board: board))

    get board_archived_path(board)

    expect(inertia_props(response)["cards"].map { |item| item["id"] }).to eq([ card.id ])
  end

  it "flags a card whose list is also archived" do
    create(:card, :archived, list: create(:list, :archived, board: board))

    get board_archived_path(board)

    expect(inertia_props(response)["cards"].first["list"]["archived"]).to be(true)
  end

  it "denies someone who cannot see the board" do
    sign_in create(:user)

    get board_archived_path(board)

    expect(response).to have_http_status(:found)
  end

  it "restores an archived list" do
    list = create(:list, :archived, board: board)

    delete board_list_archive_path(board, list)

    expect(list.reload).not_to be_archived
  end

  it "records the activity of a restored list" do
    list = create(:list, :archived, board: board)

    expect { delete board_list_archive_path(board, list) }
      .to have_enqueued_job(RecordActivityJob).with(hash_including(action: "list.restored"))
  end

  it "denies a viewer restoring a list" do
    viewer = create(:user)
    create(:membership, workspace: workspace, user: viewer, role: :member)
    create(:board_membership, board: board, user: viewer, role: :viewer)
    list = create(:list, :archived, board: board)
    sign_in viewer

    delete board_list_archive_path(board, list)

    expect(list.reload).to be_archived
  end
end
