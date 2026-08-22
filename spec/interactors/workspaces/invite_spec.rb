require 'rails_helper'

RSpec.describe Workspaces::Invite do
  let(:workspace) { create(:workspace, :owned) }

  def invite(email_address, role: :member)
    described_class.call(workspace: workspace, invited_by: workspace.owner,
                         email_address: email_address, role: role)
  end

  it "creates the invitation and enqueues the mail job" do
    expect { @result = invite("ana@example.com") }
      .to have_enqueued_job(Invitations::SendMailJob)

    expect(@result).to be_success
    expect(@result.value.role).to eq("member")
  end

  it "fails without enqueueing when the invitation is invalid" do
    expect { @result = invite("nao-e-email") }.not_to have_enqueued_job(Invitations::SendMailJob)

    expect(@result).to be_failure
  end
end
