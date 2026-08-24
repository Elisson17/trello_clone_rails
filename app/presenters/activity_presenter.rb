# Uma página do feed. O servidor manda ação, metadados e autor; a frase de cada linha é
# montada no front.
class ActivityPresenter
  def initialize(activities, pagy)
    @activities = activities
    @pagy = pagy
  end

  def as_json(*)
    {
      items: @activities.map { |activity| self.class.item(activity) },
      page: @pagy.page,
      prev_page: @pagy.previous,
      next_page: @pagy.next
    }
  end

  def self.item(activity)
    {
      id: activity.id,
      action: activity.action,
      metadata: activity.metadata,
      created_at: activity.created_at.iso8601,
      actor: activity.user && { id: activity.user.id, name: activity.user.name,
                                avatar_url: activity.user.avatar_url },
      url: url_for(activity)
    }
  end

  # O que abre ao clicar. Ação de exclusão não leva a lugar nenhum.
  def self.url_for(activity)
    return nil if activity.action.end_with?(".deleted")

    helpers = Rails.application.routes.url_helpers
    if activity.subject_type == "Card"
      helpers.card_path(activity.subject_id)
    else
      helpers.board_path(activity.board_id)
    end
  end
end
