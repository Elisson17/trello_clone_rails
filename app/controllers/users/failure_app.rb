module Users
  # Chegar na tela de login já é a mensagem — o toast "faça login ou registre-se" é ruído.
  # Falhas que dizem algo de fato (senha errada, conta não confirmada) continuam aparecendo.
  class FailureApp < Devise::FailureApp
    def i18n_message(default = nil)
      # Sem mensagem do Warden = só "você não está logado"; com mensagem (:invalid,
      # :unconfirmed) o alerta importa e passa direto.
      return nil if warden_message.blank? || warden_message == :unauthenticated

      super
    end
  end
end
