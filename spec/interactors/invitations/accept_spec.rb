require 'rails_helper'

RSpec.describe Invitations::Accept do
  let(:workspace) { create(:workspace, :owned) }
  let(:user) { create(:user, email: "ana@example.com") }
  let(:invitation) do
    create(:invitation, workspace: workspace, invited_by: workspace.owner,
                        email_address: "ana@example.com", role: :admin)
  end

  it "creates the membership with the invited role and marks the invitation accepted" do
    result = described_class.call(invitation: invitation, user: user)

    expect(result).to be_success
    expect(result.value).to be_admin
    expect(invitation.reload).to be_accepted
  end

  it "refuses an expired invitation" do
    invitation.update!(expires_at: 1.day.ago)

    expect(described_class.call(invitation: invitation, user: user).errors).to eq([ :expired ])
  end

  it "refuses an invitation already accepted" do
    invitation.update!(accepted_at: Time.current)

    expect(described_class.call(invitation: invitation, user: user).errors)
      .to eq([ :already_accepted ])
  end

  it "refuses a user with another email" do
    expect(described_class.call(invitation: invitation, user: create(:user)).errors)
      .to eq([ :wrong_email ])
  end

  it "does not duplicate an existing membership" do
    invitation # convite emitido antes de a pessoa entrar por outro caminho
    workspace.memberships.create!(user: user, role: :member)

    expect { described_class.call(invitation: invitation, user: user) }
      .not_to change(Membership, :count)
  end
end
