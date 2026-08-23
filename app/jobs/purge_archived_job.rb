class PurgeArchivedJob < ApplicationJob
  queue_as :maintenance

  RETENTION = 30.days

  def perform
    cutoff = RETENTION.ago

    Card.where(archived_at: ..cutoff).destroy_all
    List.where(archived_at: ..cutoff).destroy_all
    Board.where(archived_at: ..cutoff).destroy_all

    Invitation.pending.where(expires_at: ..Time.current).delete_all

    ActiveStorage::Blob.unattached.where(created_at: ..1.day.ago).find_each(&:purge_later)
  end
end
