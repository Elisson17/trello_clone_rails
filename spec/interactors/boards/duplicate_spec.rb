require 'rails_helper'

RSpec.describe Boards::Duplicate do
  let(:owner) { create(:user) }
  let(:board) { create(:board, :with_admin, title: "Roadmap") }
  let(:list) { create(:list, board: board, title: "A fazer") }
  let(:card) { create(:card, list: list, title: "Escrever o README") }

  def duplicate = described_class.call(board: board.reload, creator: board.creator)

  it "marks the copy in the title" do
    expect(duplicate.value.title).to eq("Roadmap (cópia)")
  end

  it "keeps the copy in the same workspace" do
    expect(duplicate.value.workspace).to eq(board.workspace)
  end

  it "copies the lists in order" do
    list
    create(:list, board: board, title: "Feito", position: 2048)

    expect(duplicate.value.lists.ordered.pluck(:title)).to eq([ "A fazer", "Feito" ])
  end

  it "copies the cards into the matching list" do
    card

    expect(duplicate.value.lists.first.cards.pluck(:title)).to eq([ "Escrever o README" ])
  end

  it "leaves archived lists out" do
    create(:list, :archived, board: board)

    expect(duplicate.value.lists.count).to eq(0)
  end

  it "copies the labels of the board" do
    create(:label, board: board, name: "bug", color: "rose")

    expect(duplicate.value.labels.pluck(:name, :color)).to eq([ [ "bug", "rose" ] ])
  end

  # O ponto todo do mapa de labels: o card da cópia aponta para a label da cópia,
  # nunca para a do board original.
  it "relinks a card to the label of the copy" do
    label = create(:label, board: board)
    card.card_labels.create!(label: label)

    expect(duplicate.value.cards.first.labels.first.board).not_to eq(board)
  end

  it "copies the checklists with their items" do
    checklist = create(:checklist, card: card, title: "Passos")
    create(:checklist_item, checklist: checklist, content: "um")

    expect(duplicate.value.cards.first.checklists.first.items.pluck(:content)).to eq([ "um" ])
  end

  it "copies the board members" do
    other = create(:user)
    board.board_memberships.create!(user: other, role: :viewer)

    expect(duplicate.value.members).to include(other)
  end

  it "copies the assignees, which only works because the members came along" do
    other = create(:user)
    board.board_memberships.create!(user: other, role: :member)
    card.card_assignments.create!(user: other)

    expect(duplicate.value.cards.first.assignees).to eq([ other ])
  end

  # Comentário e anexo são o registro de uma conversa, não parte do molde do board.
  it "leaves the comments behind" do
    create(:comment, card: card)

    expect(duplicate.value.cards.first.comments).to be_empty
  end

  it "fails when the workspace is already at the board quota" do
    board
    stub_const("Limits", Limits.merge(boards_per_workspace: 1))

    expect(duplicate).to be_failure
  end

  it "creates nothing when it fails" do
    board
    stub_const("Limits", Limits.merge(boards_per_workspace: 1))

    expect { duplicate }.not_to change(Board, :count)
  end
end
