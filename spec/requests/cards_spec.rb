require 'rails_helper'

RSpec.describe "Cards", type: :request do
  let(:workspace) { create(:workspace, :owned) }
  let(:user) { workspace.owner }
  let(:board) { create(:board, :with_admin, workspace: workspace, creator: user) }
  let(:list) { create(:list, board: board) }

  before { sign_in user }

  it "appends a card to the end of its list" do
    create(:card, list: list, position: 1024)

    post cards_path, params: { list_id: list.id, title: "Escrever o README" }

    expect(list.cards.ordered.last).to have_attributes(title: "Escrever o README", position: 2048)
  end

  it "records who created the card" do
    post cards_path, params: { list_id: list.id, title: "Card" }

    expect(Card.sole.creator).to eq(user)
  end

  it "returns errors for a blank title" do
    post cards_path, params: { list_id: list.id, title: "" }

    expect(session[:inertia_errors]).to have_key(:title)
  end

  it "edits the title and the due date" do
    card = create(:card, list: list)

    patch card_path(card), params: { title: "Novo", due_at: 3.days.from_now.iso8601 }

    expect(card.reload.title).to eq("Novo")
    expect(card.due_at).to be_present
  end

  it "completes and uncompletes" do
    card = create(:card, list: list)

    post card_completion_path(card)
    expect(card.reload).to be_completed

    delete card_completion_path(card)
    expect(card.reload).not_to be_completed
  end

  it "archives and restores" do
    card = create(:card, list: list)

    post card_archive_path(card)
    expect(card.reload).to be_archived

    delete card_archive_path(card)
    expect(card.reload).not_to be_archived
  end

  it "keeps the order after a reload" do
    %w[Um Dois Três].each { |title| post cards_path, params: { list_id: list.id, title: title } }

    get board_path(board)

    titles = inertia_props(response)["board"]["lists"].sole["cards"].pluck("title")
    expect(titles).to eq(%w[Um Dois Três])
  end

  it "denies a viewer" do
    viewer = create(:membership, workspace: workspace, user: create(:user), role: :member)
    create(:board_membership, board: board, user: viewer.user, role: :viewer)
    sign_in viewer.user

    post cards_path, params: { list_id: list.id, title: "Nada" }

    expect(Card.count).to be_zero
  end
end
