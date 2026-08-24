require 'rails_helper'

RSpec.describe "Errors", type: :request do
  let(:user) { create(:user) }

  it "answers 404 on an unknown path" do
    sign_in user

    get "/nao-existe"

    expect(response).to have_http_status(:not_found)
  end

  it "renders the error page instead of the static HTML" do
    sign_in user

    get "/nao-existe"

    expect(inertia_props(response)["status"]).to eq(404)
  end

  it "does not ask for a login before showing the error" do
    get "/nao-existe"

    expect(response).to have_http_status(:not_found)
  end

  it "turns a missing record into the same page" do
    sign_in user

    get board_path(0)

    expect(inertia_props(response)["status"]).to eq(404)
  end

  it "carries a message for the status it renders" do
    get "/500"

    expect(inertia_props(response)["message"]).to be_present
  end
end
