Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations",
    passwords: "users/passwords",
    confirmations: "users/confirmations"
  }

  resource :profile, only: %i[show update], controller: "profiles"
  patch "profile/password" => "profiles#update_password", as: :profile_password

  resources :workspaces, except: %i[new edit] do
    resources :memberships, only: %i[index update destroy], module: :workspaces
    resources :invitations, only: %i[create destroy], module: :workspaces
  end

  resources :invitations, only: [], param: :token do
    get  "accept", on: :member, action: :show, as: :accept
    post "accept", on: :member, action: :accept
  end

  # Caixa de entrada local: sem RESEND_API_KEY os e-mails caem aqui.
  mount LetterOpenerWeb::Engine, at: "/dev/mails" if Rails.env.development?

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  root "home#index"
end
