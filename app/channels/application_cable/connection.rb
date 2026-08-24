module ApplicationCable
  # O cable reaproveita a sessão do request: o Warden já está no env.
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = env["warden"]&.user || reject_unauthorized_connection
    end
  end
end
