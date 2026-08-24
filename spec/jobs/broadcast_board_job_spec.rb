require 'rails_helper'

RSpec.describe BroadcastBoardJob do
  let(:board) { create(:board) }
  let(:user) { create(:user) }

  it "publishes a thin event, with no board data in it" do
    expect { described_class.perform_now(board.id, user.id) }
      .to have_broadcasted_to(board).from_channel(BoardChannel)
      .with(type: "board.updated", by: user.id)
  end

  it "says nothing when the board is already gone" do
    board_id = board.id
    board.destroy

    expect { described_class.perform_now(board_id, user.id) }
      .not_to have_broadcasted_to(board).from_channel(BoardChannel)
  end
end
