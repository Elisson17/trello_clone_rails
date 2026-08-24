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

  # Vazio até `board_visits` existir: "recente" aqui quer dizer onde a pessoa esteve, e
  # isso ainda não é registrado em lugar nenhum. A seção some da sidebar enquanto isso.
  def recent_boards = []
end
