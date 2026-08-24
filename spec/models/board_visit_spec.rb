require 'rails_helper'

RSpec.describe BoardVisit do
  let(:user) { create(:user) }
  let(:board) { create(:board) }

  it "keeps one row per user and board" do
    create(:board_visit, user: user, board: board)

    expect(build(:board_visit, user: user, board: board)).not_to be_valid
  end

  it "requires the moment of the visit" do
    expect(build(:board_visit, viewed_at: nil)).not_to be_valid
  end

  # Visita é rastro de navegação, não conteúdo: some junto com o board sem deixar linha órfã.
  it "goes away with the board" do
    visit = create(:board_visit, user: user, board: board)

    board.destroy

    expect(BoardVisit.exists?(visit.id)).to be(false)
  end
end
