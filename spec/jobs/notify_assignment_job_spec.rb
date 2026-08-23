require 'rails_helper'

RSpec.describe NotifyAssignmentJob do
  let(:board) { create(:board) }
  let(:actor) { create(:user) }
  let(:assignee) { create(:user) }

  def activity(assignee_id:, user: actor)
    create(:activity, board: board, user: user, action: "card.assigned",
                      metadata: { "assignee_id" => assignee_id })
  end

  it "notifies whoever got the card" do
    described_class.perform_now(activity(assignee_id: assignee.id).id)

    expect(assignee.notifications.count).to eq(1)
  end

  it "stays quiet when somebody assigns a card to themselves" do
    described_class.perform_now(activity(assignee_id: actor.id).id)

    expect(Notification.count).to be_zero
  end

  it "survives an assignee that no longer exists" do
    described_class.perform_now(activity(assignee_id: 0).id)

    expect(Notification.count).to be_zero
  end
end
