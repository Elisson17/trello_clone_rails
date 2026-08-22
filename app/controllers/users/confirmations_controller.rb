module Users
  class ConfirmationsController < Devise::ConfirmationsController
    rate_limit to: 5, within: 10.minutes, only: :create, with: :too_many_attempts

    def new
      render inertia: "Auth/ResendConfirmation"
    end

    def create
      self.resource = resource_class.send_confirmation_instructions(resource_params)

      if successfully_sent?(resource)
        redirect_to new_user_session_path
      else
        redirect_to new_user_confirmation_path, inertia: { errors: resource.errors }
      end
    end

    def show
      self.resource = resource_class.confirm_by_token(params[:confirmation_token])

      if resource.errors.empty?
        set_flash_message! :notice, :confirmed
        redirect_to new_user_session_path
      else
        redirect_to new_user_confirmation_path, inertia: { errors: resource.errors }
      end
    end

    private

    def too_many_attempts
      redirect_to new_user_confirmation_path, alert: t("auth.rate_limited")
    end
  end
end
