require 'rails_helper'

RSpec.describe PurgeArchivedJob do
  let(:board) { create(:board) }
  let(:list) { create(:list, board: board) }

  it "deletes a card archived past the retention window" do
    card = create(:card, list: list, archived_at: 31.days.ago)

    described_class.perform_now

    expect(Card.exists?(card.id)).to be(false)
  end

  it "keeps a card archived yesterday" do
    card = create(:card, list: list, archived_at: 1.day.ago)

    described_class.perform_now

    expect(Card.exists?(card.id)).to be(true)
  end

  it "keeps a card that was never archived" do
    card = create(:card, list: list)

    described_class.perform_now

    expect(Card.exists?(card.id)).to be(true)
  end

  it "takes the cards of an old archived list with it" do
    old_list = create(:list, board: board, archived_at: 31.days.ago)
    card = create(:card, list: old_list)

    described_class.perform_now

    expect(Card.exists?(card.id)).to be(false)
  end

  it "takes the lists of an old archived board with it" do
    old_board = create(:board, archived_at: 31.days.ago)
    old_list = create(:list, board: old_board)

    described_class.perform_now

    expect(List.exists?(old_list.id)).to be(false)
  end

  # Convite expirado não serve para nada e ainda ocupa o índice único de convite
  # pendente por e-mail.
  it "clears an expired invitation" do
    invitation = create(:invitation)
    invitation.update_columns(expires_at: 1.day.ago)

    described_class.perform_now

    expect(Invitation.exists?(invitation.id)).to be(false)
  end

  it "keeps an invitation that is still usable" do
    invitation = create(:invitation)

    described_class.perform_now

    expect(Invitation.exists?(invitation.id)).to be(true)
  end

  # Anexo recusado pela validação deixa o blob para trás, porque ele nasce antes de a
  # validação rodar.
  it "purges the blob left behind by a rejected attachment" do
    blob = ActiveStorage::Blob.create_and_upload!(io: StringIO.new("x"), filename: "orfao.txt",
                                                  content_type: "text/plain")
    blob.update_columns(created_at: 2.days.ago)

    perform_enqueued_jobs { described_class.perform_now }

    expect(ActiveStorage::Blob.exists?(blob.id)).to be(false)
  end

  it "leaves a fresh unattached blob alone, because an upload may still be in flight" do
    blob = ActiveStorage::Blob.create_and_upload!(io: StringIO.new("x"), filename: "novo.txt",
                                                  content_type: "text/plain")

    perform_enqueued_jobs { described_class.perform_now }

    expect(ActiveStorage::Blob.exists?(blob.id)).to be(true)
  end
end
