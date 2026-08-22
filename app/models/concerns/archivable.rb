module Archivable
  extend ActiveSupport::Concern

  included do
    scope :active, -> { where(archived_at: nil) }
    scope :archived, -> { where.not(archived_at: nil) }
  end

  def archived? = archived_at.present?

  def archive! = update!(archived_at: Time.current)
  def restore! = update!(archived_at: nil)
end
