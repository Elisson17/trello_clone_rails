require 'rails_helper'

RSpec.describe "Confirmations", type: :request do
  let(:user) { create(:user, :unconfirmed) }

  it "confirms the account with a valid token" do
    get user_confirmation_path(confirmation_token: user.confirmation_token)

    expect(user.reload.confirmed_at).to be_present
  end

  it "redirects to the sign in page after confirming" do
    get user_confirmation_path(confirmation_token: user.confirmation_token)

    expect(response).to redirect_to(new_user_session_path)
  end

  it "reports an invalid token as an error instead of crashing" do
    get user_confirmation_path(confirmation_token: "nope")

    expect(response).to redirect_to(new_user_confirmation_path)
  end

  it "resends the confirmation email" do
    user
    expect { post user_confirmation_path, params: { user: { email: user.email } } }
      .to change { ActionMailer::Base.deliveries.size }.by(1)
  end
end
