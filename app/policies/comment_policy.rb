class CommentPolicy < ApplicationPolicy
  def create? = board_policy.manage_cards?

  # §3.6: só o autor edita, e só dentro da janela de 15 min.
  def update? = record.editable_by?(user)

  # Apagar é do autor ou de quem administra o board — comentário fora de tom precisa sair.
  def destroy? = record.user == user || board_policy.manage_members?

  private

  def board_policy = @board_policy ||= BoardPolicy.new(user, record.card.list.board)
end
