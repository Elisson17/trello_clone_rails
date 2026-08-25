class ProfilesController < ApplicationController
  skip_after_action :verify_authorized

  def show
    render inertia: "Profile/Show", props: {
      time_zones: ActiveSupport::TimeZone::MAPPING.values.sort,
      avatar_preset: current_user.avatar_preset,
      # A URL sai do Propshaft, que carimba o digest: o front não tem como montá-la sozinho.
      avatar_presets: User::AVATAR_PRESETS.map do |key|
        { key: key, url: helpers.image_path("avatars/#{key}.svg") }
      end
    }
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
    params.permit(:name, :time_zone, :avatar, :avatar_preset)
  end

  def password_params
    params.permit(:current_password, :password, :password_confirmation)
  end
end
