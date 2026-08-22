require 'rails_helper'

RSpec.describe "Invitations", type: :request do
  let(:workspace) { create(:workspace, :owned) }
  let(:owner) { workspace.owner }
  let(:invitee) { create(:user, email: "ana@example.com") }

  describe "POST /workspaces/:slug/invitations" do
    before { sign_in owner }

    it "creates the invitation and enqueues the mail job" do
      expect { post workspace_invitations_path(workspace), params: { email_address: "ana@example.com", role: "admin" } }
        .to have_enqueued_job(Invitations::SendMailJob)

      expect(workspace.invitations.pending.sole).to have_attributes(email_address: "ana@example.com", role: "admin")
    end

    it "returns errors for an invalid email" do
      post workspace_invitations_path(workspace), params: { email_address: "nope" }

      expect(session[:inertia_errors]).to have_key(:email_address)
    end

    it "denies a plain member" do
      member = create(:membership, workspace: workspace, user: create(:user), role: :member)
      sign_in member.user

      post workspace_invitations_path(workspace), params: { email_address: "ana@example.com" }

      expect(workspace.invitations).to be_empty
    end

    it "revokes a pending invitation" do
      invitation = create(:invitation, workspace: workspace, invited_by: owner)

      delete workspace_invitation_path(workspace, invitation)

      expect(Invitation.exists?(invitation.id)).to be(false)
    end
  end

  describe "the accept link" do
    let(:invitation) do
      create(:invitation, workspace: workspace, invited_by: owner, email_address: invitee.email, role: :admin)
    end

    it "shows the invitation to a signed-out visitor and remembers where to come back" do
      get accept_invitation_path(token: invitation.token)

      expect(response).to have_http_status(:ok)
      expect(inertia_props(response)["state"]).to eq("signed_out")
      expect(session["user_return_to"]).to eq(accept_invitation_path(token: invitation.token))
    end

    it "is ready for the invited user" do
      sign_in invitee

      get accept_invitation_path(token: invitation.token)

      expect(inertia_props(response)["state"]).to eq("ready")
    end

    it "flags another account" do
      sign_in create(:user)

      get accept_invitation_path(token: invitation.token)

      expect(inertia_props(response)["state"]).to eq("wrong_email")
    end

    it "flags an expired invitation" do
      invitation.update!(expires_at: 1.day.ago)
      sign_in invitee

      get accept_invitation_path(token: invitation.token)

      expect(inertia_props(response)["state"]).to eq("expired")
    end

    it "404s on an unknown token" do
      sign_in invitee

      get accept_invitation_path(token: "nope")

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST accept" do
    let(:invitation) do
      create(:invitation, workspace: workspace, invited_by: owner, email_address: invitee.email, role: :admin)
    end

    it "joins the workspace with the invited role" do
      sign_in invitee

      post accept_invitation_path(token: invitation.token)

      expect(response).to redirect_to(workspace_path(workspace))
      expect(workspace.membership_for(invitee)).to be_admin
      expect(invitation.reload).to be_accepted
    end

    it "requires signing in first" do
      post accept_invitation_path(token: invitation.token)

      expect(response).to redirect_to(new_user_session_path)
    end

    it "refuses an expired invitation" do
      invitation.update!(expires_at: 1.day.ago)
      sign_in invitee

      post accept_invitation_path(token: invitation.token)

      expect(workspace.membership_for(invitee)).to be_nil
      expect(flash[:alert]).to be_present
    end
  end

  # Critério de saída da etapa 3.
  it "lets two users share a workspace through an invitation" do
    sign_in owner
    post workspace_invitations_path(workspace), params: { email_address: invitee.email, role: "member" }
    sign_out owner

    perform_enqueued_jobs
    expect(ActionMailer::Base.deliveries.last.to).to eq([ invitee.email ])

    invitation = workspace.invitations.pending.sole
    sign_in invitee
    post accept_invitation_path(token: invitation.token)

    expect(workspace.reload.users).to include(owner, invitee)
  end
end
