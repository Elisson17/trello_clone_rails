require "rails_helper"

RSpec.describe NavigationPresenter do
  let(:user) { create(:user) }
  let(:workspace) { create(:workspace, name: "Produto") }

  before { create(:membership, user: user, workspace: workspace) }

  it "lists the workspaces the user belongs to" do
    expect(described_class.new(user).as_json[:workspaces])
      .to contain_exactly(hash_including(slug: workspace.slug, name: "Produto"))
  end

  it "leaves out a workspace the user does not belong to" do
    create(:workspace, name: "Outro")

    expect(described_class.new(user).as_json[:workspaces].map { |w| w[:name] }).to eq([ "Produto" ])
  end

  it "orders the workspaces by name" do
    create(:membership, user: user, workspace: create(:workspace, name: "Alpha"))

    expect(described_class.new(user).as_json[:workspaces].map { |w| w[:name] }).to eq(%w[Alpha Produto])
  end

  it "lists the visited boards, newest first" do
    older = create(:board, workspace: workspace, title: "Backlog")
    newer = create(:board, workspace: workspace, title: "Roadmap")
    create(:board_visit, user: user, board: older, viewed_at: 2.hours.ago)
    create(:board_visit, user: user, board: newer, viewed_at: 1.minute.ago)

    recent = described_class.new(user).as_json[:recent_boards]

    expect(recent.pluck(:title)).to eq([ "Roadmap", "Backlog" ])
    expect(recent.first).to include(id: newer.id, workspace_slug: workspace.slug)
  end

  it "keeps only the last five" do
    6.times do |index|
      board = create(:board, workspace: workspace)
      create(:board_visit, user: user, board: board, viewed_at: index.minutes.ago)
    end

    expect(described_class.new(user).as_json[:recent_boards].size).to eq(5)
  end

  it "leaves out a board someone else visited" do
    create(:board_visit, board: create(:board, workspace: workspace))

    expect(described_class.new(user).as_json[:recent_boards]).to be_empty
  end

  it "leaves out an archived board" do
    board = create(:board, :archived, workspace: workspace)
    create(:board_visit, user: user, board: board)

    expect(described_class.new(user).as_json[:recent_boards]).to be_empty
  end

  # A navegação viaja em toda página: se este número subir, ele sobe em todo request.
  it "takes two queries for the whole payload" do
    presenter = described_class.new(user)

    assert_queries_count(2) { presenter.as_json }
  end
end
