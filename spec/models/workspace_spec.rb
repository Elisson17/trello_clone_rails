require 'rails_helper'

RSpec.describe Workspace, type: :model do
  it { is_expected.to belong_to(:owner).class_name("User") }
  it { is_expected.to have_many(:memberships).dependent(:destroy) }
  it { is_expected.to have_many(:invitations).dependent(:destroy) }

  it "derives the slug from the name" do
    expect(create(:workspace, name: "Time de Produto").slug).to eq("time-de-produto")
  end

  it "keeps the slug unique when the name repeats" do
    create(:workspace, name: "Time")
    other = create(:workspace, name: "Time")

    expect(other.slug).to start_with("time-").and(satisfy { |slug| slug != "time" })
  end

  it "refuses more workspaces than the quota" do
    owner = create(:user)
    stub_const("Workspace::MAX_PER_USER", 1)
    create(:workspace, owner: owner)

    expect(build(:workspace, owner: owner)).to be_invalid
  end
end
