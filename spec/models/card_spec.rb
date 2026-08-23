require 'rails_helper'

RSpec.describe Card, type: :model do
  it { is_expected.to belong_to(:list).counter_cache(:cards_count) }
  it { is_expected.to belong_to(:creator).class_name("User") }

  it "keeps cards_count in sync" do
    list = create(:list)

    expect { create(:card, list: list) }.to change { list.reload.cards_count }.by(1)
  end

  it "derives overdue from due_at without persisting it" do
    expect(build(:card, :overdue)).to be_overdue
  end

  it "is not overdue once completed" do
    expect(build(:card, :overdue, :completed)).not_to be_overdue
  end

  it "is not overdue without a due date" do
    expect(build(:card, due_at: nil)).not_to be_overdue
  end

  it "rejects an attachment whose type is not on the allowlist" do
    card = build(:card)
    card.attachments.attach(io: StringIO.new("MZ"), filename: "x.exe", content_type: "application/x-msdownload")

    expect(card).to be_invalid
  end

  it "rejects an attachment bigger than the limit" do
    card = build(:card)
    io = StringIO.new("a" * (Limits[:attachment_megabytes].megabytes + 1))
    card.attachments.attach(io: io, filename: "big.pdf", content_type: "application/pdf")

    expect(card).to be_invalid
  end

  it "rejects more attachments than the limit allows" do
    card = build(:card)
    stub_const("Limits", Limits.merge(attachments_per_card: 1))
    2.times { |n| card.attachments.attach(io: StringIO.new("ok"), filename: "#{n}.pdf", content_type: "application/pdf") }

    expect(card).to be_invalid
  end

  it "accepts a small pdf" do
    card = build(:card)
    card.attachments.attach(io: StringIO.new("%PDF"), filename: "ok.pdf", content_type: "application/pdf")

    expect(card).to be_valid
  end

  it "rejects a cover color outside the board palette" do
    expect(build(:card, cover_color: "#ff0000")).to be_invalid
  end

  it "counts cards of the whole board against the quota" do
    board = create(:board)
    stub_const("Limits", Limits.merge(cards_per_board: 1))
    create(:card, list: create(:list, board: board))

    expect(build(:card, list: create(:list, board: board))).to be_invalid
  end
end
