require 'rails_helper'

RSpec.describe "Workspaces", type: :request do
  let(:user) { create(:user) }
  let(:workspace) { create(:workspace, :owned, owner: user) }

  before { sign_in user }

  it "lists only the workspaces the user belongs to" do
    workspace
    create(:workspace, :owned)

    get workspaces_path

    expect(response).to have_http_status(:ok)
    expect(inertia_props(response)["workspaces"].map { |w| w["id"] }).to eq([ workspace.id ])
  end

  it "creates a workspace with the creator as owner" do
    post workspaces_path, params: { name: "Time de Produto" }

    created = Workspace.find_by!(slug: "time-de-produto")
    expect(response).to redirect_to(workspace_path(created))
    expect(created.membership_for(user)).to be_owner
  end

  it "refuses a blank name" do
    post workspaces_path, params: { name: "" }

    expect(session[:inertia_errors]).to have_key(:name)
  end

  it "renders the workspace for a member" do
    get workspace_path(workspace)

    expect(response).to have_http_status(:ok)
  end

  it "hides the workspace from an outsider" do
    other = create(:workspace, :owned)

    get workspace_path(other)

    expect(response).to redirect_to(root_path)
    expect(flash[:alert]).to be_present
  end

  it "lets the owner rename it" do
    patch workspace_path(workspace), params: { name: "Novo nome" }

    expect(workspace.reload.name).to eq("Novo nome")
  end

  it "denies renaming to a plain member" do
    membership = create(:membership, workspace: workspace, user: create(:user), role: :member)
    sign_in membership.user

    patch workspace_path(workspace), params: { name: "Novo nome" }

    expect(workspace.reload.name).not_to eq("Novo nome")
  end

  it "lets the owner destroy a shared workspace" do
    delete workspace_path(workspace)

    expect(Workspace.exists?(workspace.id)).to be(false)
  end

  it "refuses destroying the personal workspace" do
    personal = create(:workspace, :owned, :personal, owner: user)

    delete workspace_path(personal)

    expect(Workspace.exists?(personal.id)).to be(true)
  end
end
