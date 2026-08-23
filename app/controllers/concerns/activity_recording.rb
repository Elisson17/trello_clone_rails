module ActivityRecording
  extend ActiveSupport::Concern

  private

  def record_activity(action, subject, **metadata)
    board = activity_board(subject)
    return if board.nil? || board.destroyed?

    RecordActivityJob.perform_later(
      action: action,
      board_id: board.id,
      user_id: current_user&.id,
      subject_type: subject.class.name,
      subject_id: subject.id,
      metadata: metadata
    )
  end

  def activity_board(subject)
    case subject
    when Board then subject
    when List  then subject.board
    when Card  then subject.list.board
    end
  end
end
