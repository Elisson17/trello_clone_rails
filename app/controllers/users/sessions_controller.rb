module Users
  class SessionsController < Devise::SessionsController
    rate_limit to: 10, within: 3.minutes, only: :create, with: :too_many_attempts

    def new
      render inertia: "Auth/SignIn"
    end


    private

    # Voltar para a raiz passaria pelo 401 e perderia o flash no caminho.
    def after_sign_out_path_for(_resource)
      new_user_session_path
    end

    # Sem :recall — o Warden devolveria a página de login com 422, e o Inertia
    # espera redirect + flash. Assim a falha de login vira alert na tela de login.
    def auth_options
      { scope: resource_name }
    end

    def too_many_attempts
      redirect_to new_user_session_path, alert: t("auth.rate_limited")
    end
  end
end
