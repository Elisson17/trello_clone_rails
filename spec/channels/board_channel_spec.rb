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

  it "announces the newcomer to whoever is already there" do
    expect { subscribe_as(board.creator) }
      .to have_broadcasted_to(board).from_channel(BoardChannel)
      .with(hash_including("type" => "presence.join"))
  end

  it "asks for a roll call, which is how the newcomer learns who was here" do
    expect { subscribe_as(board.creator) }
      .to have_broadcasted_to(board).from_channel(BoardChannel)
      .with(hash_including("type" => "presence.roll_call"))
  end

  it "carries who joined, because the avatar needs a name" do
    expect { subscribe_as(board.creator) }
      .to have_broadcasted_to(board).from_channel(BoardChannel)
      .with(hash_including("user" => hash_including("id" => board.creator.id,
                                                    "name" => board.creator.name)))
  end

  it "passes the tab state along" do
    subscribe_as(board.creator)

    expect { perform :state, active: true }
      .to have_broadcasted_to(board).from_channel(BoardChannel)
      .with(hash_including("type" => "presence.state", "active" => true))
  end

  it "announces the exit when the socket closes" do
    subscribe_as(board.creator)

    expect { unsubscribe }
      .to have_broadcasted_to(board).from_channel(BoardChannel)
      .with(hash_including("type" => "presence.leave"))
  end

  it "says nothing on the way out of a rejected subscription" do
    subscribe_as(create(:user))

    # Not `unsubscribe`: that test helper itself refuses to run on a rejected
    # subscription (`check_subscribed!`), before this example's own behavior is
    # even exercised. Drive the same channel callback the connection would call.
    expect { subscription.unsubscribe_from_channel }
      .not_to have_broadcasted_to(board).from_channel(BoardChannel)
  end
end
