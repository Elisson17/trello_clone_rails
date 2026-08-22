require 'rails_helper'

RSpec.describe "Registrations", type: :request do
  let(:params) do
    {
      user: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "supersecret",
        password_confirmation: "supersecret",
        time_zone: "America/Sao_Paulo"
      }
    }
  end

  it "renders the sign up page" do
    get new_user_registration_path

    expect(response).to have_http_status(:ok)
  end

  it "creates the user" do
    expect { post user_registration_path, params: params }.to change(User, :count).by(1)
  end

  it "leaves the new user unconfirmed" do
    post user_registration_path, params: params

    expect(User.last.confirmed_at).to be_nil
  end

  it "sends the confirmation email" do
    expect { post user_registration_path, params: params }
      .to change { ActionMailer::Base.deliveries.size }.by(1)
  end

  it "redirects to the sign in page" do
    post user_registration_path, params: params

    expect(response).to redirect_to(new_user_session_path)
  end

  it "does not create a user when the password confirmation does not match" do
    params[:user][:password_confirmation] = "different"

    expect { post user_registration_path, params: params }.not_to change(User, :count)
  end

  it "keeps the validation errors for the next Inertia render" do
    params[:user][:password_confirmation] = "different"
    post user_registration_path, params: params

    expect(session[:inertia_errors]).to have_key(:password_confirmation)
  end
end
