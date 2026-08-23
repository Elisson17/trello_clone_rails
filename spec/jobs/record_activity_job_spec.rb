require 'rails_helper'

RSpec.describe RecordActivityJob do
  let(:board) { create(:board) }
  let(:user) { create(:user) }

  def perform(action:, subject: board, metadata: {})
    described_class.perform_now(action: action, board_id: board.id, user_id: user.id,
                                subject_type: subject.class.name, subject_id: subject.id,
                                metadata: metadata)
  end

  it "records what happened" do
    perform(action: "board.updated", metadata: { "title" => "Novo nome" })

    expect(Activity.last).to have_attributes(action: "board.updated", board: board, user: user)
  end

  it "keeps the metadata the controller sent" do
    perform(action: "board.updated", metadata: { "title" => "Novo nome" })

    expect(Activity.last.metadata).to eq({ "title" => "Novo nome" })
  end

  it "still records when the subject is already gone" do
    card = create(:card, list: create(:list, board: board))
    id = card.id
    card.destroy

    described_class.perform_now(action: "card.deleted", board_id: board.id, user_id: user.id,
                                subject_type: "Card", subject_id: id, metadata: {})

    expect(Activity.last.action).to eq("card.deleted")
  end

  it "gives up when the board itself is gone, because the feed went with it" do
    board_id = board.id
    board.destroy

    described_class.perform_now(action: "board.updated", board_id: board_id, user_id: user.id,
                                subject_type: "Board", subject_id: board_id, metadata: {})

    expect(Activity.count).to be_zero
  end

  describe "the notifications that follow an activity" do
    it "hands a new comment to the mentions job" do
      expect { perform(action: "comment.created", metadata: { "body" => "oi @alguem" }) }
        .to have_enqueued_job(NotifyMentionsJob)
    end

    it "hands a new assignment to the assignment job" do
      expect { perform(action: "card.assigned", metadata: { "assignee_id" => user.id }) }
        .to have_enqueued_job(NotifyAssignmentJob)
    end

    it "leaves the rest alone" do
      expect { perform(action: "board.updated") }.not_to have_enqueued_job(NotifyAssignmentJob)
    end
  end
end
