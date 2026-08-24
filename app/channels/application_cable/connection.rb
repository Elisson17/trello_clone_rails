module ApplicationCable
  # O WebSocket usa a mesma sessão do request: o Warden já está no env quando o Rack chega
  # aqui, então não existe token de cable para emitir, girar ou revogar.
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = env["warden"]&.user || reject_unauthorized_connection
    end
  end
end
