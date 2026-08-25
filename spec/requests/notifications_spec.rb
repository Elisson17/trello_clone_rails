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

  describe "the unread counter shared with every page" do
    it "counts what has not been read" do
      notify

      get root_path

      expect(inertia_props(response)["unread_notifications_count"]).to eq(1)
    end

    it "ignores what was read" do
      notify(read: true)

      get root_path

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

    it "comes back to where it was fired from" do
      notify

      patch read_notifications_path, headers: { "HTTP_REFERER" => "http://www.example.com/boards/1" }

      expect(response).to redirect_to("http://www.example.com/boards/1")
    end
  end

  # A lista virou o dropdown do sino; a página que existia para isso saiu.
  it "no longer serves a notifications page" do
    get "/notifications"

    expect(response).to have_http_status(:not_found)
  end

  describe "the list shared with the bell" do
    it "does not travel in an ordinary request" do
      notify

      get root_path

      expect(inertia_props(response)).not_to have_key("notifications")
    end

    it "travels when the bell asks for it by name" do
      notify

      get root_path, headers: {
        "X-Inertia" => "true",
        "X-Inertia-Version" => InertiaRails.configuration.version,
        "X-Inertia-Partial-Data" => "notifications",
        "X-Inertia-Partial-Component" => "Boards/Index"
      }

      expect(response.parsed_body["props"]["notifications"]["items"].size).to eq(1)
    end

    it "stops at twenty, which is what the dropdown shows" do
      21.times { notify }

      get root_path, headers: {
        "X-Inertia" => "true",
        "X-Inertia-Version" => InertiaRails.configuration.version,
        "X-Inertia-Partial-Data" => "notifications",
        "X-Inertia-Partial-Component" => "Boards/Index"
      }

      expect(response.parsed_body["props"]["notifications"]["items"].size).to eq(20)
    end
  end
end
