module Users
  # Chegar na tela de login já é a mensagem — o toast "faça login ou registre-se" é ruído.
  # Falhas que dizem algo de fato (senha errada, conta não confirmada) continuam aparecendo.
  class FailureApp < Devise::FailureApp
    def respond
      return super unless request.headers["X-Inertia"].present?

      # Inertia manda XHR, e o 401 vazio que o Devise responde a XHR não é resposta Inertia
      # válida: o cliente engasga e a tela fica branca. O protocolo pede 409 com
      # `X-Inertia-Location` para o cliente fazer a navegação de página inteira.
      store_location!
      # Aqui, ao contrário da visita crua, a pessoa estava usando o app: a sessão caiu por
      # baixo dela, e sumir na tela de login sem explicação é que seria ruído.
      flash[:alert] = i18n_message || I18n.t("auth.session_expired")
      self.status = 409
      headers["X-Inertia-Location"] = scope_url
      self.response_body = ""
    end

    def i18n_message(default = nil)
      # Sem mensagem do Warden é só "não está logado"; com mensagem (:invalid,
      # :unconfirmed) o alerta importa.
      return nil if warden_message.blank? || warden_message == :unauthenticated

      super
    end
  end
end
