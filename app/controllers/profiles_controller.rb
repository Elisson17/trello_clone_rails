class ProfilesController < ApplicationController
  skip_after_action :verify_authorized

  def show
    render inertia: "Profile/Show", props: { time_zones: ActiveSupport::TimeZone::MAPPING.values.sort }
  end

  def update
    if current_user.update(profile_params)
      redirect_to profile_path, notice: t("profiles.updated")
    else
      redirect_to profile_path, inertia: { errors: current_user.errors }
    end
  end

  def update_password
    if current_user.update_with_password(password_params)
      bypass_sign_in(current_user) # troca de senha invalida a sessão; renova para não deslogar.
      redirect_to profile_path, notice: t("profiles.password_updated")
    else
      redirect_to profile_path, inertia: { errors: current_user.errors }
    end
  end

  private

  def profile_params
    params.permit(:name, :time_zone, :avatar)
  end

  def password_params
    params.permit(:current_password, :password, :password_confirmation)
  end
end
