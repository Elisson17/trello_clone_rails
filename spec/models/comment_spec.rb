require 'rails_helper'

RSpec.describe Comment, type: :model do
  it { is_expected.to belong_to(:card).counter_cache(:comments_count) }

  it "keeps comments_count in sync" do
    card = create(:card)

    expect { create(:comment, card: card) }.to change { card.reload.comments_count }.by(1)
  end

  it "lets the author edit inside the fifteen minute window" do
    comment = create(:comment)

    expect(comment).to be_editable_by(comment.user)
  end

  it "closes the window after fifteen minutes" do
    comment = create(:comment, created_at: 16.minutes.ago)

    expect(comment).not_to be_editable_by(comment.user)
  end

  it "never lets somebody else edit" do
    expect(create(:comment)).not_to be_editable_by(create(:user))
  end
end
