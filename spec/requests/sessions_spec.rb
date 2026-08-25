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

  # A sessão caindo no meio do uso chegava como 401 vazio, que não é resposta Inertia:
  # o cliente engasgava e a tela ficava branca.
  describe "when the session dies under a running app" do
    def inertia_get
      get root_path, headers: {
        "X-Inertia" => "true",
        "X-Inertia-Version" => InertiaRails.configuration.version,
        "X-Requested-With" => "XMLHttpRequest"
      }
    end

    it "asks the client for a full page visit to the login" do
      inertia_get

      expect(response).to have_http_status(:conflict)
      expect(response.headers["X-Inertia-Location"]).to eq(new_user_session_url)
    end

    it "says why, because the person was in the middle of something" do
      inertia_get

      expect(flash[:alert]).to eq(I18n.t("auth.session_expired"))
    end
  end
end
