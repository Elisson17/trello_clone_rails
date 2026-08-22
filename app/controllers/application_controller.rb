class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # O app é todo autenticado: quem não está logado cai no /users/sign_in.
  before_action :authenticate_user!, unless: :devise_controller?
  before_action :configure_permitted_parameters, if: :devise_controller?

  include Pundit::Authorization

  # Nenhuma action escapa da autorização; quem não precisa pula o callback explicitamente.
  after_action :verify_authorized, unless: :devise_controller?

  rescue_from Pundit::NotAuthorizedError do
    redirect_back fallback_location: root_path, alert: t("policies.denied")
  end

  inertia_share do
    {
      auth: { user: current_user && user_props(current_user) },
      flash: { notice: flash.notice, alert: flash.alert }
    }
  end

  private

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: %i[name time_zone])
  end

  def user_props(user)
    {
      id: user.id,
      name: user.name,
      email: user.email,
      time_zone: user.time_zone,
      avatar_url: user.avatar.attached? ? url_for(user.avatar) : nil
    }
  end
end
