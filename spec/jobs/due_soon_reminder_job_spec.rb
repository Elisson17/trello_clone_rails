require 'rails_helper'

RSpec.describe DueSoonReminderJob do
  let(:board) { create(:board) }
  let(:list) { create(:list, board: board) }
  let(:assignee) { create(:user) }

  before { board.board_memberships.create!(user: assignee, role: :member) }

  def card_due(due_at, **attributes)
    create(:card, list: list, due_at: due_at, **attributes).tap do |card|
      card.card_assignments.create!(user: assignee)
    end
  end

  it "notifies whoever is responsible for a card due within the window" do
    card_due(6.hours.from_now)

    described_class.perform_now

    expect(assignee.notifications.count).to eq(1)
  end

  it "signs the activity as the system, because no person did it" do
    card_due(6.hours.from_now)

    described_class.perform_now

    expect(Activity.last.user).to be_nil
  end

  it "does not warn twice about the same card" do
    card_due(6.hours.from_now)

    2.times { described_class.perform_now }

    expect(assignee.notifications.count).to eq(1)
  end

  it "ignores a card that is due later than the window" do
    card_due(3.days.from_now)

    described_class.perform_now

    expect(Notification.count).to be_zero
  end

  it "ignores a card that is already done" do
    card_due(6.hours.from_now, completed_at: Time.current)

    described_class.perform_now

    expect(Notification.count).to be_zero
  end

  it "ignores a card that is already overdue, which is not news anymore" do
    card_due(2.hours.ago)

    described_class.perform_now

    expect(Notification.count).to be_zero
  end

  it "has nobody to warn when the card has no assignee" do
    create(:card, list: list, due_at: 6.hours.from_now)

    described_class.perform_now

    expect(Notification.count).to be_zero
  end

  it "leaves an archived card out" do
    card_due(6.hours.from_now).archive!

    described_class.perform_now

    expect(Notification.count).to be_zero
  end
end
