class NotifyMentionsJob < ApplicationJob
  queue_as :notifications

  MENTION = /@([a-z0-9._+-]+)/i

  def perform(activity_id)
    activity = Activity.find_by(id: activity_id)
    return unless activity

    handles = activity.metadata["body"].to_s.scan(MENTION).flatten.map(&:downcase).uniq
    return if handles.empty?

    mentioned(activity, handles).each { |user| Notification.create_or_find_by!(user: user, activity: activity) }
  end

  private

  # O identificador é a parte do e-mail antes do arroba: `demo@example.com` é `@demo`.
  def mentioned(activity, handles)
    activity.board.members.reject { |user| user.id == activity.user_id }
            .select { |user| handles.include?(user.email.split("@").first.downcase) }
  end
end
