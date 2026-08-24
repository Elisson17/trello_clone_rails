require 'rails_helper'

# O detalhe do card é uma rota, não um estado de front: `/cards/:id` devolve a página do
# board com uma prop `card` a mais. Todos os endpoints do modal voltam para essa mesma
# rota, porque é isso que mantém o modal aberto depois de cada mudança.
RSpec.describe "Card details", type: :request do
  let(:workspace) { create(:workspace, :owned) }
  let(:user) { workspace.owner }
  let(:board) { create(:board, :with_admin, workspace: workspace, creator: user) }
  let(:list) { create(:list, board: board) }
  let(:card) { create(:card, list: list, creator: user) }

  before { sign_in user }

  describe "showing" do
    it "renders the board page" do
      get card_path(card)

      expect(inertia_props(response)["board"]["id"]).to eq(board.id)
    end

    it "adds the card prop with everything the modal needs" do
      get card_path(card)

      expect(inertia_props(response)["card"]).to include("id" => card.id, "checklists" => [])
    end

    it "denies somebody who cannot see the board" do
      sign_in create(:user)

      get card_path(card)

      expect(response).to redirect_to(root_path)
    end

    it "loads the modal without a single N+1" do
      create(:label, board: board).then { |label| card.card_labels.create!(label: label) }
      create(:comment, card: card, user: user)
      create(:checklist_item, checklist: create(:checklist, card: card))

      expect_no_n_plus_one { get card_path(card) }
    end
  end

  describe "description and cover" do
    it "saves the markdown description" do
      patch card_path(card), params: { description: "# Plano\n\n- um" }

      expect(card.reload.description).to include("# Plano")
    end

    it "sets the cover color" do
      patch card_path(card), params: { cover_color: "rose" }

      expect(card.reload.cover_color).to eq("rose")
    end

    it "clears the cover when the front sends it empty" do
      card.update!(cover_color: "rose")

      patch card_path(card), params: { cover_color: "" }

      expect(card.reload.cover_color).to be_nil
    end

    it "clears the due date the same way" do
      card.update!(due_at: 2.days.from_now)

      patch card_path(card), params: { due_at: "" }

      expect(card.reload.due_at).to be_nil
    end

    it "keeps the modal open after editing" do
      patch card_path(card), params: { title: "Novo" }

      expect(response).to redirect_to(card_path(card))
    end
  end

  describe "labels" do
    let(:label) { create(:label, board: board, name: "bug") }

    it "marks the label on the card" do
      post card_labels_path(card), params: { label_id: label.id }

      expect(card.reload.labels).to eq([ label ])
    end

    it "unmarks it" do
      card.card_labels.create!(label: label)

      delete card_label_path(card, label)

      expect(card.reload.labels).to be_empty
    end

    it "refuses a label from another board" do
      post card_labels_path(card), params: { label_id: create(:label).id }

      expect(card.reload.labels).to be_empty
    end

    it "creates a label on the board" do
      post board_labels_path(board), params: { name: "urgente", color: "amber" }

      expect(board.labels.pluck(:name)).to eq([ "urgente" ])
    end

    it "returns errors for a duplicated label name" do
      label

      post board_labels_path(board), params: { name: "bug", color: "sky" }

      expect(session[:inertia_errors]).to have_key(:name)
    end

    it "deletes a label of the board" do
      label

      delete board_label_path(board, label)

      expect(board.labels).to be_empty
    end
  end

  describe "assignees" do
    let(:member) { create(:user) }

    before { board.board_memberships.create!(user: member, role: :member) }

    it "assigns a board member" do
      post card_assignments_path(card), params: { user_id: member.id }

      expect(card.reload.assignees).to eq([ member ])
    end

    it "unassigns" do
      card.card_assignments.create!(user: member)

      delete card_assignment_path(card, member)

      expect(card.reload.assignees).to be_empty
    end

    it "refuses somebody who is not a member of the board" do
      post card_assignments_path(card), params: { user_id: create(:user).id }

      expect(card.reload.assignees).to be_empty
    end
  end

  describe "checklists" do
    it "adds a checklist" do
      post card_checklists_path(card), params: { title: "Passos" }

      expect(card.reload.checklists.pluck(:title)).to eq([ "Passos" ])
    end

    it "adds an item at the end" do
      checklist = create(:checklist, card: card)
      create(:checklist_item, checklist: checklist, position: 1024)

      post checklist_items_path, params: { checklist_id: checklist.id, content: "dois" }

      expect(checklist.items.ordered.last).to have_attributes(content: "dois", position: 2048)
    end

    it "checks an item" do
      item = create(:checklist_item, checklist: create(:checklist, card: card))

      patch checklist_item_path(item), params: { completed: true }

      expect(item.reload).to be_completed
    end

    it "unchecks it" do
      item = create(:checklist_item, :completed, checklist: create(:checklist, card: card))

      patch checklist_item_path(item), params: { completed: false }

      expect(item.reload).not_to be_completed
    end

    it "renames an item without touching its state" do
      item = create(:checklist_item, :completed, checklist: create(:checklist, card: card))

      patch checklist_item_path(item), params: { content: "outro" }

      expect(item.reload).to have_attributes(content: "outro", completed_at: be_present)
    end

    it "deletes the items along with the checklist" do
      checklist = create(:checklist, card: card)
      create(:checklist_item, checklist: checklist)

      expect { delete card_checklist_path(card, checklist) }.to change(ChecklistItem, :count).by(-1)
    end
  end

  describe "comments" do
    it "posts a comment" do
      post card_comments_path(card), params: { body: "Olá" }

      expect(card.reload.comments.sole).to have_attributes(body: "Olá", user: user)
    end

    it "returns errors for an empty comment" do
      post card_comments_path(card), params: { body: "" }

      expect(session[:inertia_errors]).to have_key(:body)
    end

    it "lets the author edit inside the window" do
      comment = create(:comment, card: card, user: user)

      patch card_comment_path(card, comment), params: { body: "Editado" }

      expect(comment.reload.body).to eq("Editado")
    end

    it "marks the comment as edited" do
      comment = create(:comment, card: card, user: user)

      patch card_comment_path(card, comment), params: { body: "Editado" }

      expect(comment.reload).to be_edited
    end

    # Passados os 15 min, só apagar.
    it "refuses an edit after the window closed" do
      comment = create(:comment, card: card, user: user, created_at: 16.minutes.ago)

      patch card_comment_path(card, comment), params: { body: "Tarde" }

      expect(comment.reload.body).not_to eq("Tarde")
    end

    it "refuses an edit from somebody else" do
      other = create(:user)
      board.board_memberships.create!(user: other, role: :member)
      comment = create(:comment, card: card, user: user)
      sign_in other

      patch card_comment_path(card, comment), params: { body: "Alheio" }

      expect(comment.reload.body).not_to eq("Alheio")
    end

    it "lets the board admin delete a comment from somebody else" do
      other = create(:user)
      board.board_memberships.create!(user: other, role: :member)
      comment = create(:comment, card: card, user: other)

      delete card_comment_path(card, comment)

      expect { comment.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe "attachments" do
    def upload(name, type, size = 4)
      Rack::Test::UploadedFile.new(StringIO.new("a" * size), type, original_filename: name)
    end

    it "attaches an allowed file" do
      post card_attachments_path(card), params: { file: upload("plano.pdf", "application/pdf") }

      expect(card.reload.attachments.count).to eq(1)
    end

    it "refuses a type outside the allowlist" do
      post card_attachments_path(card), params: { file: upload("x.exe", "application/x-msdownload") }

      expect(card.reload.attachments).to be_empty
    end

    it "returns errors when the file is refused" do
      post card_attachments_path(card), params: { file: upload("x.exe", "application/x-msdownload") }

      expect(session[:inertia_errors]).to have_key(:attachments)
    end

    it "refuses a file over the size limit" do
      big = upload("big.pdf", "application/pdf", Limits[:attachment_megabytes].megabytes + 1)

      post card_attachments_path(card), params: { file: big }

      expect(card.reload.attachments).to be_empty
    end

    it "refuses one more than the limit allows" do
      stub_const("Limits", Limits.merge(attachments_per_card: 1))
      card.attachments.attach(io: StringIO.new("ok"), filename: "1.pdf", content_type: "application/pdf")
      card.save!

      post card_attachments_path(card), params: { file: upload("2.pdf", "application/pdf") }

      expect(card.reload.attachments.count).to eq(1)
    end

    it "deletes an attachment" do
      card.attachments.attach(io: StringIO.new("ok"), filename: "1.pdf", content_type: "application/pdf")
      card.save!

      delete card_attachment_path(card, card.attachments.sole.id)

      expect(card.reload.attachments).to be_empty
    end
  end

  describe "a viewer" do
    let(:viewer) { create(:user) }

    before do
      create(:membership, workspace: workspace, user: viewer, role: :member)
      board.board_memberships.create!(user: viewer, role: :viewer)
      sign_in viewer
    end

    it "opens the card" do
      get card_path(card)

      expect(response).to have_http_status(:ok)
    end

    it "cannot comment" do
      post card_comments_path(card), params: { body: "Nada" }

      expect(card.reload.comments).to be_empty
    end

    it "cannot attach anything" do
      file = Rack::Test::UploadedFile.new(StringIO.new("a"), "application/pdf", original_filename: "x.pdf")

      post card_attachments_path(card), params: { file: file }

      expect(card.reload.attachments).to be_empty
    end
  end
end
