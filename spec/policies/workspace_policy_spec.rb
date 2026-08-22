require 'rails_helper'

RSpec.describe WorkspacePolicy do
  subject(:policy) { described_class.new(user, workspace) }

  let(:workspace) { create(:workspace, :owned) }
  let(:user) { create(:user) }

  def member_with(role)
    workspace.memberships.create!(user: user, role: role)
    user
  end

  {
    owner: { show: true, update: true, destroy: true, manage_members: true, leave: true },
    admin: { show: true, update: false, destroy: false, manage_members: true, leave: true },
    member: { show: true, update: false, destroy: false, manage_members: false, leave: true }
  }.each do |role, expectations|
    context "as #{role}" do
      before { member_with(role) }

      expectations.each do |action, allowed|
        it "#{allowed ? 'allows' : 'denies'} #{action}?" do
          expect(policy.public_send(:"#{action}?")).to be(allowed)
        end
      end
    end
  end

  context "as an outsider" do
    it { is_expected.not_to be_show }
    it { is_expected.not_to be_update }
    it { is_expected.not_to be_destroy }
    it { is_expected.not_to be_manage_members }
    it { is_expected.not_to be_leave }
  end

  it "denies leaving to the last owner of a shared workspace" do
    workspace = create(:workspace, :owned, owner: user)

    expect(described_class.new(user, workspace)).not_to be_leave
  end

  context "when the workspace is personal" do
    let(:workspace) { create(:workspace, :owned, :personal, owner: user) }

    it { is_expected.not_to be_destroy }
    it { is_expected.not_to be_leave }
    it { is_expected.to be_update }
  end

  describe "Scope" do
    it "returns only the workspaces the user belongs to" do
      member_with(:member)
      create(:workspace, :owned)

      expect(described_class::Scope.new(user, Workspace).resolve).to contain_exactly(workspace)
    end
  end
end
