class NotificationPresenter
  # `pagy` é opcional porque o dropdown não pagina; a página, que ainda existe, passa o dela.
  def initialize(notifications, pagy = nil)
    @notifications = notifications
    @pagy = pagy
  end

  def as_json(*)
    payload = { items: @notifications.map { |notification| item(notification) } }
    return payload if @pagy.nil?

    payload.merge(page: @pagy.page, prev_page: @pagy.previous, next_page: @pagy.next)
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
