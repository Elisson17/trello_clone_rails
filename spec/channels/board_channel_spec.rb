require 'rails_helper'

RSpec.describe BoardChannel, type: :channel do
  let(:board) { create(:board, :with_admin) }

  def subscribe_as(user, id: board.id)
    stub_connection current_user: user
    subscribe(id: id)
  end

  it "streams the board to a member" do
    subscribe_as(board.creator)

    expect(subscription).to have_stream_for(board)
  end

  it "rejects someone with no access to the board" do
    subscribe_as(create(:user))

    expect(subscription).to be_rejected
  end

  it "rejects a board that does not exist" do
    subscribe_as(board.creator, id: 0)

    expect(subscription).to be_rejected
  end
end
