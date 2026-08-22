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
