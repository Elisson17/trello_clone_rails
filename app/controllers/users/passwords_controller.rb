module Users
  class PasswordsController < Devise::PasswordsController
    rate_limit to: 5, within: 10.minutes, only: :create, with: :too_many_attempts

    def new
      render inertia: "Auth/ForgotPassword"
    end

    def edit
      render inertia: "Auth/ResetPassword", props: { reset_password_token: params[:reset_password_token] }
    end

    def create
      self.resource = resource_class.send_reset_password_instructions(resource_params)

      # successfully_sent? já põe o flash paranoico (não revela se o e-mail existe).
      if successfully_sent?(resource)
        redirect_to new_user_session_path
      else
        redirect_to new_user_password_path, inertia: { errors: resource.errors }
      end
    end

    def update
      self.resource = resource_class.reset_password_by_token(resource_params)

      if resource.errors.empty?
        if resource.active_for_authentication?
          set_flash_message! :notice, :updated
          sign_in(resource_name, resource)
          redirect_to root_path
        else
          # Conta ainda não confirmada: senha trocada, mas o login continua bloqueado.
          set_flash_message! :notice, :updated_not_active
          redirect_to new_user_session_path
        end
      else
        redirect_to edit_user_password_path(reset_password_token: resource_params[:reset_password_token]),
                    inertia: { errors: resource.errors }
      end
    end

    private

    def too_many_attempts
      redirect_to new_user_password_path, alert: t("auth.rate_limited")
    end
  end
end
