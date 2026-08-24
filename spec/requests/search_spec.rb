require 'rails_helper'

RSpec.describe "Search", type: :request do
  let(:workspace) { create(:workspace, :owned) }
  let(:user) { workspace.owner }
  let(:board) { create(:board, :with_admin, workspace: workspace, creator: user, title: "Produto") }
  let(:list) { create(:list, board: board) }

  before { sign_in user }

  it "finds a board by title" do
    board

    get search_path, params: { q: "prod" }

    expect(inertia_props(response)["boards"].map { |result| result["id"] }).to eq([ board.id ])
  end

  it "finds a card by title" do
    card = create(:card, list: list, title: "Revisar contrato")

    get search_path, params: { q: "contrato" }

    expect(inertia_props(response)["cards"].map { |result| result["id"] }).to eq([ card.id ])
  end

  it "tells the card which board and list it lives in" do
    create(:card, list: list, title: "Revisar contrato")

    get search_path, params: { q: "contrato" }

    expect(inertia_props(response)["cards"].first["board"]).to include("id" => board.id, "title" => "Produto")
  end

  it "hides a board the user cannot see" do
    create(:board, title: "Segredo alheio")

    get search_path, params: { q: "segredo" }

    expect(inertia_props(response)["boards"]).to be_empty
  end

  it "hides a card from a board the user cannot see" do
    create(:card, list: create(:list), title: "Segredo alheio")

    get search_path, params: { q: "segredo" }

    expect(inertia_props(response)["cards"]).to be_empty
  end

  it "hides an archived board" do
    create(:board, :archived, workspace: workspace, creator: user, title: "Guardado")

    get search_path, params: { q: "guardado" }

    expect(inertia_props(response)["boards"]).to be_empty
  end

  it "hides an archived card" do
    create(:card, :archived, list: list, title: "Guardado")

    get search_path, params: { q: "guardado" }

    expect(inertia_props(response)["cards"]).to be_empty
  end

  it "hides a card whose list is archived" do
    create(:card, list: create(:list, :archived, board: board), title: "Guardado")

    get search_path, params: { q: "guardado" }

    expect(inertia_props(response)["cards"]).to be_empty
  end

  it "renders the page with no term" do
    get search_path

    expect(inertia_props(response)["term"]).to eq("")
  end

  it "requires a signed in user" do
    sign_out user

    get search_path, params: { q: "prod" }

    expect(response).to redirect_to(new_user_session_path)
  end
end
