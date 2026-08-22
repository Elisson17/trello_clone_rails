require 'rails_helper'

RSpec.describe "Passwords", type: :request do
  let(:user) { create(:user) }

  it "sends the reset instructions" do
    expect { post user_password_path, params: { user: { email: user.email } } }
      .to change { ActionMailer::Base.deliveries.size }.by(1)
  end

  it "answers the same way for an unknown email" do
    post user_password_path, params: { user: { email: "ghost@example.com" } }

    expect(response).to redirect_to(new_user_session_path)
  end

  it "renders the reset form for a token" do
    get edit_user_password_path(reset_password_token: "anything")

    expect(response).to have_http_status(:ok)
  end

  it "changes the password with a valid token" do
    token = user.send_reset_password_instructions
    put user_password_path, params: {
      user: { reset_password_token: token, password: "brandnewpass", password_confirmation: "brandnewpass" }
    }

    expect(user.reload.valid_password?("brandnewpass")).to be(true)
  end

  it "signs the user in after a successful reset" do
    token = user.send_reset_password_instructions
    put user_password_path, params: {
      user: { reset_password_token: token, password: "brandnewpass", password_confirmation: "brandnewpass" }
    }

    expect(response).to redirect_to(root_path)
  end

  it "rejects an invalid token" do
    put user_password_path, params: {
      user: { reset_password_token: "nope", password: "brandnewpass", password_confirmation: "brandnewpass" }
    }

    expect(session[:inertia_errors]).to have_key(:reset_password_token)
  end
end
