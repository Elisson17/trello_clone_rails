require 'rails_helper'

RSpec.describe InvitationPolicy do
  let(:workspace) { create(:workspace, :owned) }
  let(:invitation) { build(:invitation, workspace: workspace, invited_by: workspace.owner) }

  it "lets the owner invite and revoke" do
    policy = described_class.new(workspace.owner, invitation)

    expect(policy).to be_create
    expect(policy).to be_destroy
  end

  it "lets an admin invite" do
    admin = workspace.memberships.create!(user: create(:user), role: :admin)

    expect(described_class.new(admin.user, invitation)).to be_create
  end

  it "denies a member" do
    member = workspace.memberships.create!(user: create(:user), role: :member)

    expect(described_class.new(member.user, invitation)).not_to be_create
  end

  it "denies an outsider" do
    expect(described_class.new(create(:user), invitation)).not_to be_create
  end
end
