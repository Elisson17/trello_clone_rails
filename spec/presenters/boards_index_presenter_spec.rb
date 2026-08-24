require 'rails_helper'

RSpec.describe BoardsIndexPresenter do
  let(:workspace) { create(:workspace, :owned) }
  let(:user) { workspace.owner }
  let(:board) { create(:board, :with_admin, workspace: workspace, creator: user, title: "Roadmap") }

  def payload(scope = Board.where(id: board.id))
    described_class.new(boards: scope, user: user).as_json
  end

  it "carries the workspace and the owner of each board" do
    expect(payload.sole).to include(
      id: board.id,
      title: "Roadmap",
      workspace: { slug: workspace.slug, name: workspace.name },
      owner: hash_including(id: user.id, name: user.name)
    )
  end

  it "has no last visit until the person opens it" do
    expect(payload.sole[:last_visited_at]).to be_nil
  end

  it "carries the last visit of this person, and not of someone else" do
    create(:board_visit, user: create(:user), board: board, viewed_at: 1.day.ago)
    create(:board_visit, user: user, board: board, viewed_at: "2026-08-24T10:00:00Z")

    expect(payload.sole[:last_visited_at]).to eq("2026-08-24T10:00:00Z")
  end

  # O preview é um board em miniatura: uma barra por lista, na ordem da lista.
  it "previews up to six lists, in position order, with the cover colors" do
    first = create(:list, board: board, position: 1024)
    second = create(:list, board: board, position: 2048)
    create_list(:card, 2, list: first, cover_color: "rose")
    create(:card, list: first, cover_color: nil)
    create(:card, list: second, cover_color: "sky")

    preview = payload.sole[:preview]

    expect(preview.map { |bar| bar[:list_id] }).to eq([ first.id, second.id ])
    expect(preview.first).to include(count: 3)
    expect(preview.first[:colors]).to eq([ "rose", "rose" ])
  end

  it "keeps an empty list in the preview as a zero bar" do
    empty = create(:list, board: board)

    expect(payload.sole[:preview].sole).to include(list_id: empty.id, count: 0, colors: [])
  end

  it "counts lists, cards and overdue cards" do
    list = create(:list, board: board)
    create(:card, list: list)
    create(:card, :overdue, list: list)
    create(:card, :archived, list: list)

    expect(payload.sole[:counts]).to eq(lists: 1, cards: 2, overdue: 1)
  end

  it "shows three avatars and the real member total" do
    5.times { create(:board_membership, board: board, user: create(:user)) }

    members = payload.sole[:members]

    expect(members[:avatars].size).to eq(3)
    expect(members[:total]).to eq(board.board_memberships.count)
  end

  # O contrato é o número ser fixo: a home lista board de todo workspace, então tudo que
  # for por board multiplica. Se este número subir junto com a quantidade, é N+1 de volta.
  it "costs the same number of queries for three boards and for thirty" do
    # A cota real é 25 boards por workspace (config/limits.yml); o spec só precisa dos 30
    # boards para provar que a contagem de queries não escala com N.
    stub_const("Limits", Limits.merge(boards_per_workspace: 30))

    3.times { create(:board, :with_admin, workspace: workspace, creator: user) }
    scope = Board.where(workspace: workspace)
    small = count_queries { described_class.new(boards: scope, user: user).as_json }

    27.times { create(:board, :with_admin, workspace: workspace, creator: user) }

    assert_queries_count(small) { described_class.new(boards: scope, user: user).as_json }
  end

  # counts.cards é o total do board, não da preview: uma 7ª lista com cards não pode
  # desaparecer da soma só porque saiu da vitrine.
  it "counts every card, including lists past the preview cutoff" do
    7.times { |i| create(:list, board: board, position: (i + 1) * 1024) }
    board.lists.order(:position).each { |list| create(:card, list: list) }

    result = payload.sole

    expect(result[:preview].size).to eq(6)
    expect(result[:counts][:cards]).to eq(7)
  end

  def count_queries(&block)
    queries = 0
    counter = ->(*, payload) { queries += 1 unless payload[:name].in?([ "SCHEMA", "TRANSACTION" ]) }
    ActiveSupport::Notifications.subscribed(counter, "sql.active_record", &block)
    queries
  end
end
