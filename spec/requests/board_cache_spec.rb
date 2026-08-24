require 'rails_helper'

# O payload do board é a parte caríssima da página e é igual para todo mundo que vê o
# board, então ele fica em Solid Cache com a chave no `updated_at` do board. O que estes
# specs guardam é a invalidação: a cadeia toda dá `touch` até o board (ver `Board`), e
# cache que não invalida é bug servido rápido.
RSpec.describe "Board payload cache", type: :request do
  let(:workspace) { create(:workspace, :owned) }
  let(:user) { workspace.owner }
  let(:board) { create(:board, :with_admin, workspace: workspace, creator: user) }
  let(:list) { create(:list, board: board) }
  let!(:card) { create(:card, list: list, title: "Primeiro card") }

  # O ambiente de teste roda com `:null_store` de propósito (spec não deve herdar estado
  # de outro spec); aqui o cache precisa existir para haver algo a invalidar.
  around do |example|
    store = Rails.cache
    Rails.cache = ActiveSupport::Cache::MemoryStore.new
    example.run
    Rails.cache = store
  end

  before { sign_in user }

  def board_payload
    get board_path(board)
    inertia_props(response)["board"]
  end

  it "builds the payload once for two identical requests" do
    allow(BoardPresenter).to receive(:new).and_call_original

    2.times { board_payload }

    expect(BoardPresenter).to have_received(:new).once
  end

  it "rebuilds it after the board itself changes" do
    board_payload

    patch board_path(board), params: { title: "Outro nome" }

    expect(board_payload["title"]).to eq("Outro nome")
  end

  it "rebuilds it after a card changes, three levels down" do
    board_payload

    patch card_path(card), params: { title: "Card renomeado" }

    expect(board_payload["lists"].sole["cards"].sole["title"]).to eq("Card renomeado")
  end

  it "rebuilds it after a comment, which only moves a counter" do
    board_payload

    post card_comments_path(card), params: { body: "Vamos nessa" }

    expect(board_payload["lists"].sole["cards"].sole["comments_count"]).to eq(1)
  end

  it "rebuilds it after a checklist item, four levels down" do
    checklist = create(:checklist, card: card)
    board_payload

    post checklist_items_path, params: { checklist_id: checklist.id, content: "Um item" }

    expect(board_payload["lists"].sole["cards"].sole["checklist"]).to eq({ "done" => 0, "total" => 1 })
  end
end
