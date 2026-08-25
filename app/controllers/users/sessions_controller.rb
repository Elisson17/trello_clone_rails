module Users
  class SessionsController < Devise::SessionsController
    # Duas travas com chaves diferentes: por IP contra força bruta numa conta só, e por
    # e-mail contra credential stuffing, que troca de IP a cada tentativa e passa reto
    # pela primeira. `name:` é o que separa as duas contagens na mesma action.
    rate_limit to: 10, within: 3.minutes, only: :create, name: "sign-in-ip",
               with: :too_many_attempts
    # `if:` é o que evita o balde compartilhado: sem ele, toda tentativa sem e-mail cairia
    # na mesma chave vazia e trancaria o login de todo mundo. O teto é folgado de propósito
    # — apertar demais deixaria qualquer um trancar a conta alheia de fora.
    rate_limit to: 15, within: 20.minutes, only: :create, name: "sign-in-account",
               by: -> { params.dig(:user, :email).to_s.downcase.strip },
               if: -> { params.dig(:user, :email).present? },
               with: :too_many_attempts

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
