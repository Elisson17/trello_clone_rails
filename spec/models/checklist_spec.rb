require 'rails_helper'

RSpec.describe Checklist, type: :model do
  it { is_expected.to belong_to(:card) }

  it "orders its items by position" do
    checklist = create(:checklist)
    second = create(:checklist_item, checklist: checklist, position: 2048)
    first = create(:checklist_item, checklist: checklist, position: 1024)

    expect(checklist.reload.items.to_a).to eq([ first, second ])
  end

  it "takes its items down with it" do
    checklist = create(:checklist)
    create(:checklist_item, checklist: checklist)

    expect { checklist.destroy }.to change(ChecklistItem, :count).by(-1)
  end
end
