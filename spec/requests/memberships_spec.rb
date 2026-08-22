require 'rails_helper'

RSpec.describe "Workspace memberships", type: :request do
  let(:workspace) { create(:workspace, :owned) }
  let(:owner) { workspace.owner }
  let(:member) { create(:membership, workspace: workspace, user: create(:user), role: :member) }

  before { sign_in owner }

  it "lists the members with the pending invitations" do
    member
    create(:invitation, workspace: workspace, invited_by: owner)

    get workspace_memberships_path(workspace)

    props = inertia_props(response)
    expect(props["members"].size).to eq(2)
    expect(props["invitations"].size).to eq(1)
    expect(props["can"]["manage_members"]).to be(true)
  end

  it "hides the pending invitations from a plain member" do
    create(:invitation, workspace: workspace, invited_by: owner)
    sign_in member.user

    get workspace_memberships_path(workspace)

    expect(inertia_props(response)["invitations"]).to be_empty
  end

  it "promotes a member to admin" do
    patch workspace_membership_path(workspace, member), params: { role: "admin" }

    expect(member.reload).to be_admin
  end

  it "denies a member changing roles" do
    other = create(:membership, workspace: workspace, user: create(:user), role: :member)
    sign_in member.user

    patch workspace_membership_path(workspace, other), params: { role: "admin" }

    expect(other.reload).to be_member
  end

  it "refuses demoting the last owner" do
    owner_membership = workspace.memberships.owner.sole

    patch workspace_membership_path(workspace, owner_membership), params: { role: "member" }

    expect(owner_membership.reload).to be_owner
  end

  it "removes a member" do
    delete workspace_membership_path(workspace, member)

    expect(Membership.exists?(member.id)).to be(false)
  end

  it "lets a member leave and sends them back to the list" do
    sign_in member.user

    delete workspace_membership_path(workspace, member)

    expect(response).to redirect_to(workspaces_path)
    expect(Membership.exists?(member.id)).to be(false)
  end

  it "refuses letting the last owner leave" do
    owner_membership = workspace.memberships.owner.sole

    delete workspace_membership_path(workspace, owner_membership)

    expect(Membership.exists?(owner_membership.id)).to be(true)
    expect(flash[:alert]).to be_present
  end
end
