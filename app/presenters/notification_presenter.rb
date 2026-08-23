class NotificationPresenter
  def initialize(notifications, pagy)
    @notifications = notifications
    @pagy = pagy
  end

  def as_json(*)
    {
      items: @notifications.map { |notification| item(notification) },
      page: @pagy.page,
      prev_page: @pagy.previous,
      next_page: @pagy.next
    }
  end

  private

  def item(notification)
    {
      id: notification.id,
      read: notification.read?,
      created_at: notification.created_at.iso8601,
      board: { id: notification.activity.board_id, title: notification.activity.board.title },
      activity: ActivityPresenter.item(notification.activity)
    }
  end
end
