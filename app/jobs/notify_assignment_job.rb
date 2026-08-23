class NotifyAssignmentJob < ApplicationJob
  queue_as :notifications

  def perform(activity_id)
    activity = Activity.find_by(id: activity_id)
    assignee_id = activity&.metadata&.dig("assignee_id")
    return if assignee_id.nil? || assignee_id == activity.user_id

    user = User.find_by(id: assignee_id)
    Notification.create_or_find_by!(user: user, activity: activity) if user
  end
end
