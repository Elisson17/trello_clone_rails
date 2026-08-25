require 'rails_helper'

RSpec.describe "Profiles", type: :request do
  let(:user) { create(:user, password: "supersecret") }

  before { sign_in user }

  it "renders the profile page" do
    get profile_path

    expect(response).to have_http_status(:ok)
  end

  it "updates the name" do
    patch profile_path, params: { name: "Grace Hopper" }

    expect(user.reload.name).to eq("Grace Hopper")
  end

  it "updates the time zone" do
    patch profile_path, params: { time_zone: "Europe/Lisbon" }

    expect(user.reload.time_zone).to eq("Europe/Lisbon")
  end

  it "attaches the avatar" do
    patch profile_path, params: {
      avatar: Rack::Test::UploadedFile.new(StringIO.new("tiny"), "image/png", original_filename: "a.png")
    }

    expect(user.reload.avatar).to be_attached
  end

  describe "the ready-made avatar discs" do
    def upload
      Rack::Test::UploadedFile.new(StringIO.new("tiny"), "image/png", original_filename: "a.png")
    end

    it "ships the list with digested urls, which the front cannot build" do
      get profile_path

      presets = inertia_props(response)["avatar_presets"]

      expect(presets.size).to eq(User::AVATAR_PRESETS.size)
      expect(presets.first["url"]).to include("avatars/vermelho")
    end

    it "picks one" do
      patch profile_path, params: { avatar_preset: "violeta" }

      expect(user.reload.avatar_preset).to eq("violeta")
    end

    it "answers avatar_url with the disc, so nothing downstream has to know" do
      patch profile_path, params: { avatar_preset: "violeta" }

      expect(user.reload.avatar_url).to include("avatars/violeta")
    end

    it "refuses a colour that is not on the list" do
      patch profile_path, params: { avatar_preset: "chartreuse" }

      expect(session[:inertia_errors]).to have_key(:avatar_preset)
    end

    # Os dois respondem à mesma pergunta; guardar ambos deixaria o `avatar_url` ambíguo.
    it "drops the uploaded photo when a disc is picked" do
      patch profile_path, params: { avatar: upload }
      patch profile_path, params: { avatar_preset: "violeta" }

      expect(user.reload.avatar).not_to be_attached
    end

    it "drops the disc when a photo is uploaded" do
      patch profile_path, params: { avatar_preset: "violeta" }
      patch profile_path, params: { avatar: upload }

      expect(user.reload.avatar_preset).to be_nil
    end

    # Sem isto a escolha é porta de mão única: dá para trocar de avatar, nunca para tirar.
    it "goes back to no avatar at all" do
      patch profile_path, params: { avatar_preset: "violeta" }
      patch profile_path, params: { avatar_preset: "" }

      expect(user.reload.avatar_url).to be_nil
    end
  end

  it "refuses a blank name" do
    patch profile_path, params: { name: "" }

    expect(session[:inertia_errors]).to have_key(:name)
  end

  it "changes the password with the current one" do
    patch profile_password_path, params: {
      current_password: "supersecret", password: "anotherpass", password_confirmation: "anotherpass"
    }

    expect(user.reload.valid_password?("anotherpass")).to be(true)
  end

  it "keeps the session alive after changing the password" do
    patch profile_password_path, params: {
      current_password: "supersecret", password: "anotherpass", password_confirmation: "anotherpass"
    }
    get profile_path

    expect(response).to have_http_status(:ok)
  end

  it "refuses a wrong current password" do
    patch profile_password_path, params: {
      current_password: "wrong", password: "anotherpass", password_confirmation: "anotherpass"
    }

    expect(session[:inertia_errors]).to have_key(:current_password)
  end
end
