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

  it "has no recent boards until visits are recorded" do
    expect(described_class.new(user).as_json[:recent_boards]).to be_empty
  end

  # A navegação viaja em toda página: se este número subir, ele sobe em todo request.
  it "takes one query for the whole payload" do
    presenter = described_class.new(user)

    assert_queries_count(1) { presenter.as_json }
  end
end
