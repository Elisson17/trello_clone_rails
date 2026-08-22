module Users
  class RegistrationsController < Devise::RegistrationsController
    rate_limit to: 5, within: 10.minutes, only: :create, with: :too_many_attempts

    def new
      render inertia: "Auth/SignUp", props: { time_zones: ActiveSupport::TimeZone::MAPPING.values.sort }
    end

    def create
      register = Users::Register.new(sign_up_params)
      result = register.call
      self.resource = register.user

      if result.success?
        set_flash_message! :notice, :"signed_up_but_#{resource.inactive_message}"
        redirect_to new_user_session_path
      else
        clean_up_passwords(resource)
        redirect_to new_user_registration_path, inertia: { errors: resource.errors }
      end
    end

    private

    def too_many_attempts
      redirect_to new_user_registration_path, alert: t("auth.rate_limited")
    end
  end
end
