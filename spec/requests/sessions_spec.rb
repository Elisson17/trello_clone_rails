require 'rails_helper'

RSpec.describe "Sessions", type: :request do
  let(:user) { create(:user, password: "supersecret") }

  it "renders the sign in page" do
    get new_user_session_path

    expect(response).to have_http_status(:ok)
  end

  it "signs in with the right credentials" do
    post user_session_path, params: { user: { email: user.email, password: "supersecret" } }

    expect(response).to redirect_to(root_path)
  end

  it "refuses a wrong password" do
    post user_session_path, params: { user: { email: user.email, password: "wrong" } }

    expect(response).to redirect_to(new_user_session_path)
  end

  it "refuses an unconfirmed account" do
    unconfirmed = create(:user, :unconfirmed, password: "supersecret")
    post user_session_path, params: { user: { email: unconfirmed.email, password: "supersecret" } }

    expect(flash[:alert]).to eq(I18n.t("devise.failure.unconfirmed"))
  end

  it "signs out back to the sign in page" do
    sign_in user
    delete destroy_user_session_path

    expect(response).to redirect_to(new_user_session_path)
  end

  it "sends anonymous visitors to the sign in page" do
    get root_path

    expect(response).to redirect_to(new_user_session_path)
  end

  it "does not nag the anonymous visitor with a flash" do
    get root_path

    expect(flash[:alert]).to be_nil
  end

  it "lets a signed in user reach the app" do
    sign_in user
    get root_path

    expect(response).to have_http_status(:ok)
  end
end
