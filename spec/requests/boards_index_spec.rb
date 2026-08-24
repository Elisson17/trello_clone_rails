require 'rails_helper'

RSpec.describe "Boards index", type: :request do
  let(:workspace) { create(:workspace, :owned) }
  let(:user) { workspace.owner }

  before { sign_in user }

  it "is the home page" do
    board = create(:board, :with_admin, workspace: workspace, creator: user, title: "Roadmap")

    get root_path

    expect(response).to have_http_status(:ok)
    expect(inertia_props(response)["boards"].sole).to include("id" => board.id, "title" => "Roadmap")
  end

  it "spans every workspace the person belongs to" do
    other = create(:workspace, :owned)
    create(:membership, workspace: other, user: user, role: :member)
    create(:board, :with_admin, workspace: workspace, creator: user)
    create(:board, workspace: other, visibility: :workspace_wide)

    get root_path

    expect(inertia_props(response)["boards"].size).to eq(2)
  end

  it "leaves out a board the person cannot see" do
    create(:board, workspace: create(:workspace, :owned))

    get root_path

    expect(inertia_props(response)["boards"]).to be_empty
  end

  it "leaves archived boards out" do
    create(:board, :archived, :with_admin, workspace: workspace, creator: user)

    get root_path

    expect(inertia_props(response)["boards"]).to be_empty
  end

  it "renders the same page scoped to one workspace, with its header" do
    create(:board, :with_admin, workspace: workspace, creator: user)
    other = create(:workspace, :owned)
    create(:membership, workspace: other, user: user, role: :member)
    create(:board, workspace: other, visibility: :workspace_wide)

    get workspace_path(workspace)

    props = inertia_props(response)
    expect(props["boards"].size).to eq(1)
    expect(props["workspace"]).to include("slug" => workspace.slug)
    expect(props["can"]).to include("create_board" => true)
  end

  # A lista de workspaces é a sidebar agora; a página que existia para isso saiu.
  it "no longer serves a workspace list" do
    get "/workspaces"

    expect(response).to have_http_status(:not_found)
  end
end
