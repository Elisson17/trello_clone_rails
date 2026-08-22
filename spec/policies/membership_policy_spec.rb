require 'rails_helper'

RSpec.describe MembershipPolicy do
  let(:workspace) { create(:workspace, :owned) }
  let(:owner) { workspace.owner }
  let(:target) { workspace.memberships.create!(user: create(:user), role: :member) }

  def membership_for(role)
    workspace.memberships.create!(user: create(:user), role: role)
  end

  it "lets an owner change someone else's role" do
    expect(described_class.new(owner, target)).to be_update
  end

  it "lets an admin change someone else's role" do
    admin = membership_for(:admin)

    expect(described_class.new(admin.user, target)).to be_update
  end

  it "denies a member changing roles" do
    member = membership_for(:member)

    expect(described_class.new(member.user, target)).not_to be_update
  end

  it "denies changing your own role" do
    expect(described_class.new(target.user, target)).not_to be_update
  end

  it "lets anyone remove their own membership" do
    expect(described_class.new(target.user, target)).to be_destroy
  end

  it "denies a member removing someone else" do
    member = membership_for(:member)

    expect(described_class.new(member.user, target)).not_to be_destroy
  end

  it "denies removing the last owner, even to themselves" do
    owner_membership = workspace.memberships.owner.sole

    expect(described_class.new(owner, owner_membership)).not_to be_destroy
  end

  it "allows removing an owner once another owner exists" do
    owner_membership = workspace.memberships.owner.sole
    membership_for(:owner)

    expect(described_class.new(owner, owner_membership)).to be_destroy
  end

  it "denies an outsider entirely" do
    outsider = create(:user)

    expect(described_class.new(outsider, target)).not_to be_destroy
  end
end
