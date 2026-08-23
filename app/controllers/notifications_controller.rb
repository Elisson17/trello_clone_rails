class NotificationsController < ApplicationController
  skip_after_action :verify_authorized

  def index
    pagy, notifications = pagy(current_user.notifications.recent.includes(activity: %i[user board]), limit: 20)

    render inertia: "Notifications/Index",
           props: { notifications: NotificationPresenter.new(notifications, pagy).as_json }
  end

  def read
    current_user.notifications.unread.update_all(read_at: Time.current)
    redirect_to notifications_path, notice: t("notifications.all_read")
  end
end
