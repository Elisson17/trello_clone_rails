require 'rails_helper'

RSpec.describe NotifyMentionsJob do
  let(:board) { create(:board) }
  let(:author) { create(:user, email: "autor@example.com") }
  let(:member) { create(:user, email: "maria@example.com") }

  before do
    board.board_memberships.create!(user: author, role: :admin)
    board.board_memberships.create!(user: member, role: :member)
  end

  def comment_activity(body, user: author)
    create(:activity, board: board, user: user, action: "comment.created",
                      metadata: { "body" => body })
  end

  it "notifies the mentioned member" do
    described_class.perform_now(comment_activity("bom dia @maria").id)

    expect(member.notifications.count).to eq(1)
  end

  it "ignores a name that is not on the board" do
    described_class.perform_now(comment_activity("e o @joao?").id)

    expect(Notification.count).to be_zero
  end

  it "does not notify the author of their own mention" do
    described_class.perform_now(comment_activity("eu, @autor, digo").id)

    expect(author.notifications.count).to be_zero
  end

  it "notifies once when the same person is mentioned twice" do
    described_class.perform_now(comment_activity("@maria e @maria").id)

    expect(member.notifications.count).to eq(1)
  end

  # O job pode rodar duas vezes (retry, ou seeds que chamam na mão e enfileiram junto):
  # a segunda passada acha a notificação que já existe em vez de estourar.
  it "stays quiet on a second run" do
    activity = comment_activity("bom dia @maria")

    2.times { described_class.perform_now(activity.id) }

    expect(member.notifications.count).to eq(1)
  end

  it "does nothing when the comment has no mention" do
    described_class.perform_now(comment_activity("sem menção nenhuma").id)

    expect(Notification.count).to be_zero
  end
end
