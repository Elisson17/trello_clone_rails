class DueSoonReminderJob < ApplicationJob
  queue_as :notifications

  WINDOW = 24.hours
  ACTION = "card.due_soon"

  def perform
    due_soon.each do |card|
      next if card.assignees.empty? || already_warned?(card)

      activity = Activity.create!(board: card.list.board, subject: card, action: ACTION,
                                  metadata: { title: card.title, due_at: card.due_at.iso8601 })
      card.assignees.each { |user| Notification.create_or_find_by!(user: user, activity: activity) }
    end
  end

  private

  def due_soon
    Card.active.where(completed_at: nil, due_at: Time.current..WINDOW.from_now)
        .includes(:assignees, list: :board)
  end

  # O job roda de hora em hora e a janela é de 24h, então o mesmo card cairia na busca
  # 24 vezes. Uma atividade de aviso por janela é o suficiente.
  def already_warned?(card)
    Activity.about(card).exists?(action: ACTION, created_at: WINDOW.ago..)
  end
end
