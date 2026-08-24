# A navegação é shared prop: ela viaja em toda página. Por isso é uma query barata e nada
# mais — nome e slug bastam, e a cor da bolinha o front deriva do slug (`lib/accent.ts`).
class NavigationPresenter
  def initialize(user)
    @user = user
  end

  def as_json(*)
    { workspaces: workspaces, recent_boards: recent_boards }
  end

  private

  attr_reader :user

  def workspaces
    Workspace.joins(:memberships).where(memberships: { user: user })
             .order(:name)
             .pluck(:slug, :name)
             .map { |slug, name| { slug: slug, name: name } }
  end

  # Uma query só: junta a visita ao board e ao workspace e devolve colunas, sem instanciar
  # modelo nenhum — isto viaja em toda navegação cheia.
  def recent_boards
    BoardVisit.joins(board: :workspace)
              .where(user: user, boards: { archived_at: nil })
              .order(viewed_at: :desc)
              .limit(5)
              .pluck("boards.id", "boards.title", "workspaces.slug")
              .map { |id, title, slug| { id: id, title: title, workspace_slug: slug } }
  end
end
