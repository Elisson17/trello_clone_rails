require 'rails_helper'

# O feed é a mesma página do board com uma prop a mais, igual ao detalhe do card: painel
# é rota, não estado de front.
RSpec.describe "Activities", type: :request do
  let(:workspace) { create(:workspace, :owned) }
  let(:user) { workspace.owner }
  let(:board) { create(:board, :with_admin, workspace: workspace, creator: user) }
  let(:list) { create(:list, board: board) }
  let(:card) { create(:card, list: list, creator: user) }

  before { sign_in user }

  describe "the board feed" do
    it "renders the board page" do
      get board_activities_path(board)

      expect(inertia_props(response)["board"]["id"]).to eq(board.id)
    end

    it "sends the newest activity first" do
      create(:activity, board: board, user: user, action: "board.updated", created_at: 2.days.ago)
      create(:activity, board: board, user: user, action: "card.created", created_at: 1.hour.ago)

      get board_activities_path(board)

      expect(inertia_props(response)["activities"]["items"].first["action"]).to eq("card.created")
    end

    it "says where the next page is when there is one" do
      create_list(:activity, 21, board: board, user: user)

      get board_activities_path(board)

      expect(inertia_props(response)["activities"]["next_page"]).to eq(2)
    end

    it "serves the second page" do
      create_list(:activity, 21, board: board, user: user)

      get board_activities_path(board, page: 2)

      expect(inertia_props(response)["activities"]["items"].size).to eq(1)
    end

    it "leaves out the activity of another board" do
      create(:activity, action: "board.updated")

      get board_activities_path(board)

      expect(inertia_props(response)["activities"]["items"]).to be_empty
    end

    it "denies who cannot see the board" do
      sign_in create(:user)

      get board_activities_path(create(:board, :private_board))

      expect(response).to redirect_to(root_path)
    end

    it "loads the feed without a single N+1" do
      create_list(:activity, 5, board: board, user: create(:user))

      expect_no_n_plus_one { get board_activities_path(board) }
    end
  end

  describe "the card feed" do
    it "comes with the card detail" do
      create(:activity, board: board, user: user, subject: card, action: "card.created")

      get card_path(card)

      expect(inertia_props(response)["activities"]["items"].size).to eq(1)
    end

    it "keeps out what happened to another card" do
      create(:activity, board: board, user: user, subject: create(:card, list: list),
                        action: "card.created")

      get card_path(card)

      expect(inertia_props(response)["activities"]["items"]).to be_empty
    end

    it "has no link on a deleted subject, because there is nothing to open" do
      create(:activity, board: board, user: user, subject: card, action: "card.deleted")

      get card_path(card)

      expect(inertia_props(response)["activities"]["items"].first["url"]).to be_nil
    end
  end

  # A atividade nunca é gravada dentro do request.
  describe "what a mutation enqueues" do
    it "records the card that was created" do
      expect { post cards_path, params: { list_id: list.id, title: "Novo" } }
        .to have_enqueued_job(RecordActivityJob)
        .with(hash_including(action: "card.created"))
    end

    it "records which fields a card update touched" do
      expect { patch card_path(card), params: { description: "texto" } }
        .to have_enqueued_job(RecordActivityJob)
        .with(hash_including(metadata: hash_including(fields: [ "description" ])))
    end

    it "records nothing when the mutation failed" do
      expect { post cards_path, params: { list_id: list.id, title: "" } }
        .not_to have_enqueued_job(RecordActivityJob)
    end

    it "records the move with both list names, which is what the feed reads" do
      other = create(:list, board: board, title: "Feito")

      expect { patch card_position_path(card), params: { list_id: other.id, index: 0 } }
        .to have_enqueued_job(RecordActivityJob)
        .with(hash_including(metadata: hash_including(from: list.title, to: "Feito")))
    end

    it "records the comment body, because the mentions job reads it from there" do
      expect { post card_comments_path(card), params: { body: "oi @alguem" } }
        .to have_enqueued_job(RecordActivityJob)
        .with(hash_including(metadata: hash_including(body: "oi @alguem")))
    end

    it "records the assignee id, because the assignment job reads it from there" do
      board.board_memberships.create!(user: create(:user), role: :member).then do |membership|
        expect { post card_assignments_path(card), params: { user_id: membership.user_id } }
          .to have_enqueued_job(RecordActivityJob)
          .with(hash_including(metadata: hash_including(assignee_id: membership.user_id)))
      end
    end
  end
end
