Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations",
    passwords: "users/passwords",
    confirmations: "users/confirmations"
  }

  resource :profile, only: %i[show update], controller: "profiles"
  patch "profile/password" => "profiles#update_password", as: :profile_password

  # Caixa de entrada local: sem RESEND_API_KEY os e-mails caem aqui.
  mount LetterOpenerWeb::Engine, at: "/dev/mails" if Rails.env.development?

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  root "home#index"
end
