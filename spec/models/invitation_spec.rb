require 'rails_helper'

RSpec.describe Invitation, type: :model do
  let(:workspace) { create(:workspace, :owned) }

  it { is_expected.to belong_to(:workspace) }
  it { is_expected.to belong_to(:invited_by).class_name("User") }

  it "generates a token and a 7-day expiry" do
    invitation = create(:invitation, workspace: workspace)

    expect(invitation.token).to be_present
    expect(invitation.expires_at).to be_within(1.minute).of(Invitation::EXPIRES_IN.from_now)
  end

  it "downcases and strips the email" do
    expect(create(:invitation, email_address: "  Ana@Example.COM ").email_address)
      .to eq("ana@example.com")
  end

  it "refuses a second pending invitation for the same email" do
    create(:invitation, workspace: workspace, email_address: "ana@example.com")

    expect(build(:invitation, workspace: workspace, email_address: "ana@example.com")).to be_invalid
  end

  it "allows reinviting after the first invitation was accepted" do
    create(:invitation, :accepted, workspace: workspace, email_address: "ana@example.com")

    expect(build(:invitation, workspace: workspace, email_address: "ana@example.com")).to be_valid
  end

  it "refuses inviting someone who is already a member" do
    member = create(:user)
    workspace.memberships.create!(user: member, role: :member)

    expect(build(:invitation, workspace: workspace, email_address: member.email)).to be_invalid
  end

  it "knows when it expired" do
    expect(build(:invitation, :expired)).to be_expired
  end
end
