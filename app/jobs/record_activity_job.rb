class RecordActivityJob < ApplicationJob
  queue_as :default

  NOTIFIERS = {
    "comment.created" => NotifyMentionsJob,
    "card.assigned" => NotifyAssignmentJob
  }.freeze

  def perform(action:, board_id:, subject_type:, subject_id:, user_id: nil, metadata: {})
    return unless Board.exists?(id: board_id)

    activity = Activity.create!(action: action, board_id: board_id, user_id: user_id,
                               subject_type: subject_type, subject_id: subject_id, metadata: metadata)

    NOTIFIERS[action]&.perform_later(activity.id)

    # Toda atividade é uma mutação no board, e toda mutação é um evento de realtime.
    # Avisar daqui deixa o controller sem saber que existe WebSocket.
    BroadcastBoardJob.perform_later(board_id, user_id)
  end
end
