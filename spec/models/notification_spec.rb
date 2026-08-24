require 'rails_helper'

RSpec.describe Notification, type: :model do
  it { is_expected.to belong_to(:user) }
  it { is_expected.to belong_to(:activity) }

  describe ".unread" do
    it "leaves out what was already read" do
      unread = create(:notification)
      create(:notification, read_at: Time.current)

      expect(described_class.unread.to_a).to eq([ unread ])
    end
  end

  describe "#read?" do
    it "is false while read_at is empty" do
      expect(create(:notification)).not_to be_read
    end
  end

  # Job com retry não pode duplicar aviso, e quem segura é o índice único: com uma
  # validação na frente, o `create_or_find_by!` levantaria RecordInvalid em vez de achar
  # a linha que já existe.
  describe "the same activity twice for the same person" do
    it "is refused by the database" do
      first = create(:notification)

      expect { create(:notification, user: first.user, activity: first.activity) }
        .to raise_error(ActiveRecord::RecordNotUnique)
    end

    it "is what create_or_find_by! recovers from, so a retried job stays quiet" do
      first = create(:notification)

      expect(Notification.create_or_find_by!(user: first.user, activity: first.activity)).to eq(first)
    end
  end
end
