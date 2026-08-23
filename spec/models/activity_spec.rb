require 'rails_helper'

RSpec.describe Activity, type: :model do
  it { is_expected.to validate_presence_of(:action) }
  it { is_expected.to belong_to(:board) }
  it { is_expected.to belong_to(:subject).optional }

  describe "the actor" do
    it "is optional, because a recurring job has none" do
      activity = build(:activity, user: nil)

      expect(activity).to be_valid
    end
  end

  describe ".recent" do
    it "puts the newest first" do
      old = create(:activity, created_at: 2.days.ago)
      new = create(:activity, created_at: 1.hour.ago)

      expect(described_class.recent.to_a).to eq([ new, old ])
    end
  end

  describe ".about" do
    it "keeps only what happened to that subject" do
      card = create(:card)
      mine = create(:activity, subject: card, action: "card.created")
      create(:activity, action: "board.updated")

      expect(described_class.about(card).to_a).to eq([ mine ])
    end
  end
end
