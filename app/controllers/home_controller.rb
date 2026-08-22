class HomeController < ApplicationController
  skip_after_action :verify_authorized

  def index
    render inertia: "Home"
  end
end
