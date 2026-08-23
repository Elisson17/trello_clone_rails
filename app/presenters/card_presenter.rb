# Payload do modal do card. O board por trás continua vindo do BoardPresenter — este
# presenter só acrescenta o que não cabe num tile: descrição, checklists item a item,
# comentários e anexos.
class CardPresenter
  def initialize(card, user:)
    @card = card
    @user = user
  end

  def as_json(*)
    {
      id: @card.id,
      list: { id: @card.list.id, title: @card.list.title },
      title: @card.title,
      description: @card.description,
      due_at: @card.due_at&.iso8601,
      completed: @card.completed?,
      overdue: @card.overdue?,
      cover_color: @card.cover_color,
      created_at: @card.created_at.iso8601,
      creator: { id: @card.creator.id, name: @card.creator.name },
      label_ids: @card.label_ids,
      assignee_ids: @card.assignee_ids,
      checklists: @card.checklists.map { |checklist| checklist_props(checklist) },
      comments: comments.map { |comment| comment_props(comment) },
      attachments: @card.attachments.map { |attachment| attachment_props(attachment) }
    }
  end

  private

  def comments = @card.comments.includes(:user).chronological

  def checklist_props(checklist)
    items = checklist.items.to_a

    {
      id: checklist.id,
      title: checklist.title,
      done: items.count(&:completed?),
      total: items.size,
      items: items.map { |item| { id: item.id, content: item.content, completed: item.completed? } }
    }
  end

  def comment_props(comment)
    {
      id: comment.id,
      body: comment.body,
      created_at: comment.created_at.iso8601,
      edited: comment.edited?,
      author: { id: comment.user.id, name: comment.user.name, avatar_url: comment.user.avatar_url },
      can_edit: comment.editable_by?(@user),
      can_destroy: CommentPolicy.new(@user, comment).destroy?
    }
  end

  def attachment_props(attachment)
    {
      id: attachment.id,
      filename: attachment.filename.to_s,
      byte_size: attachment.byte_size,
      content_type: attachment.content_type,
      url: Rails.application.routes.url_helpers.rails_blob_path(attachment, only_path: true)
    }
  end
end
