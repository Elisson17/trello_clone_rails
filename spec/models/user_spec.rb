require 'rails_helper'

RSpec.describe User, type: :model do
  it { is_expected.to validate_presence_of(:name) }
  it { is_expected.to validate_length_of(:name).is_at_most(80) }

  it "rejects an unknown time zone" do
    user = build(:user, time_zone: "Mars/Olympus")

    expect(user).not_to be_valid
  end

  it "rejects an avatar that is not an allowed image type" do
    user = create(:user)
    user.avatar.attach(io: StringIO.new("not an image"), filename: "x.txt", content_type: "text/plain")

    expect(user).not_to be_valid
  end

  it "rejects an avatar bigger than 2 MB" do
    user = create(:user)
    user.avatar.attach(io: StringIO.new("a" * 3.megabytes), filename: "big.png", content_type: "image/png")

    expect(user).not_to be_valid
  end

  it "accepts a small png avatar" do
    user = create(:user)
    user.avatar.attach(io: StringIO.new("tiny"), filename: "ok.png", content_type: "image/png")

    expect(user).to be_valid
  end

  it "is not active for authentication before confirming the email" do
    expect(build(:user, :unconfirmed)).not_to be_active_for_authentication
  end
end
