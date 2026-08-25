class NotificationsController < ApplicationController
  skip_after_action :verify_authorized

  def read
    current_user.notifications.unread.update_all(read_at: Time.current)
    redirect_back fallback_location: root_path, notice: t("notifications.all_read")
  end
end
