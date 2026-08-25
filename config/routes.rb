Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations",
    passwords: "users/passwords",
    confirmations: "users/confirmations"
  }

  get "search" => "searches#show", as: :search

  resource :profile, only: %i[show update], controller: "profiles"
  patch "profile/password" => "profiles#update_password", as: :profile_password

  resources :notifications, only: [] do
    patch :read, on: :collection
  end

  resources :workspaces, except: %i[new edit index] do
    resources :memberships, only: %i[index update destroy], module: :workspaces
    resources :invitations, only: %i[create destroy], module: :workspaces
    resources :boards, only: %i[index create], module: :workspaces
  end

  resources :boards, only: %i[show update destroy] do
    scope module: :boards do
      resource :archive, only: %i[create destroy]
      # Painel de arquivados do board: listas e cards guardados, com restauração.
      resource :archived, only: :show, controller: "archived"
      resource :duplicate, only: :create
      resources :labels, only: %i[create destroy]
      resources :memberships, only: %i[create update destroy]
      resources :activities, only: :index
    end
    resources :lists, only: %i[create update destroy] do
      scope module: :lists do
        resource :position, only: :update
        # Arquivar lista é o `destroy` dela; restaurar é apagar o arquivamento.
        resource :archive, only: :destroy
      end
    end
  end

  # `show` do card é o modal: renderiza a mesma página do board, com uma prop a mais.
  resources :cards, only: %i[show create update destroy] do
    scope module: :cards do
      resource :completion, only: %i[create destroy]
      resource :archive, only: %i[create destroy]
      resource :position, only: :update
      resources :labels, only: %i[create destroy]
      resources :assignments, only: %i[create destroy]
      resources :checklists, only: %i[create destroy]
      resources :comments, only: %i[create update destroy]
      resources :attachments, only: %i[create destroy]
    end
  end

  resources :checklist_items, only: %i[create update destroy]

  resources :invitations, only: [], param: :token do
    get  "accept", on: :member, action: :show, as: :accept
    post "accept", on: :member, action: :accept
  end

  # Caixa de entrada local: sem RESEND_API_KEY os e-mails caem aqui.
  mount LetterOpenerWeb::Engine, at: "/dev/mails" if Rails.env.development?

  # Alvos do `exceptions_app` (ver `application.rb`).
  match "/404", to: "errors#show", via: :all, defaults: { status: 404 }
  match "/422", to: "errors#show", via: :all, defaults: { status: 422 }
  match "/500", to: "errors#show", via: :all, defaults: { status: 500 }

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # A home é o índice de boards: quem entra quer o board de ontem, não escolher um ambiente.
  root "boards#index"

  # Rota que não existe é 404 na mesma página das outras — precisa ser a última.
  match "*path", to: "errors#show", via: :all, defaults: { status: 404 },
        constraints: ->(request) { !request.path.start_with?("/rails/", "/dev/") }
end
