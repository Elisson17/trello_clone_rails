require 'rails_helper'

RSpec.describe Membership, type: :model do
  let(:workspace) { create(:workspace, :owned) }
  let(:owner_membership) { workspace.memberships.owner.first }

  it { is_expected.to belong_to(:workspace) }
  it { is_expected.to belong_to(:user) }
  it { is_expected.to define_enum_for(:role).with_values(owner: 0, admin: 1, member: 2) }

  it "refuses the same user twice in a workspace" do
    expect(build(:membership, workspace: workspace, user: workspace.owner)).to be_invalid
  end

  it "refuses demoting the last owner" do
    expect(owner_membership.update(role: :admin)).to be(false)
    expect(owner_membership.errors[:role]).to be_present
  end

  it "refuses destroying the last owner" do
    expect(owner_membership.destroy).to be(false)
    expect(workspace.memberships.reload).to include(owner_membership)
  end

  it "allows demoting an owner when another one remains" do
    workspace.memberships.create!(user: create(:user), role: :owner)

    expect(owner_membership.update(role: :admin)).to be(true)
  end

  it "lets a plain member leave" do
    membership = workspace.memberships.create!(user: create(:user), role: :member)

    expect(membership.destroy).to be_truthy
  end
end
