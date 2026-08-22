require 'rails_helper'

RSpec.describe Cards::Create do
  let(:list) { create(:list) }
  let(:creator) { create(:user) }

  it "appends the card at the end of the list" do
    create(:card, list: list, position: 2048)

    card = described_class.call(list: list, creator: creator, attributes: { title: "Card" }).value

    expect(card.position).to eq(2048 + Positioned::STEP)
  end

  it "records who created it" do
    card = described_class.call(list: list, creator: creator, attributes: { title: "Card" }).value

    expect(card.creator).to eq(creator)
  end

  it "fails on a blank title" do
    expect(described_class.call(list: list, creator: creator, attributes: { title: "" })).to be_failure
  end
end
