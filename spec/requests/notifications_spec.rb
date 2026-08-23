require 'rails_helper'

RSpec.describe "Notifications", type: :request do
  let(:user) { create(:user) }
  let(:board) { create(:board) }

  before { sign_in user }

  def notify(read: false)
    activity = create(:activity, board: board, action: "card.assigned",
                                 metadata: { "title" => "Card", "assignee_id" => user.id })
    create(:notification, user: user, activity: activity, read_at: read ? Time.current : nil)
  end

  describe "the list" do
    it "sends my notifications" do
      notify

      get notifications_path

      expect(inertia_props(response)["notifications"]["items"].size).to eq(1)
    end

    it "leaves out somebody else's" do
      create(:notification)

      get notifications_path

      expect(inertia_props(response)["notifications"]["items"]).to be_empty
    end

    it "carries the activity, which is what the line is made of" do
      notify

      get notifications_path

      expect(inertia_props(response)["notifications"]["items"].first["activity"]["action"])
        .to eq("card.assigned")
    end

    it "paginates" do
      21.times { notify }

      get notifications_path

      expect(inertia_props(response)["notifications"]["next_page"]).to eq(2)
    end

    it "loads without a single N+1" do
      3.times { notify }

      expect_no_n_plus_one { get notifications_path }
    end
  end

  describe "the unread counter shared with every page" do
    it "counts what has not been read" do
      notify

      get notifications_path

      expect(inertia_props(response)["unread_notifications_count"]).to eq(1)
    end

    it "ignores what was read" do
      notify(read: true)

      get notifications_path

      expect(inertia_props(response)["unread_notifications_count"]).to be_zero
    end
  end

  describe "marking everything as read" do
    it "clears the counter" do
      notify

      patch read_notifications_path

      expect(user.notifications.unread.count).to be_zero
    end

    it "does not touch somebody else's" do
      other = create(:notification)

      patch read_notifications_path

      expect(other.reload.read_at).to be_nil
    end

    it "goes back to the list" do
      patch read_notifications_path

      expect(response).to redirect_to(notifications_path)
    end
  end

  it "sends who is not signed in to the login" do
    sign_out user

    get notifications_path

    expect(response).to redirect_to(new_user_session_path)
  end
end
