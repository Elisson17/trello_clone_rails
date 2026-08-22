class HomeController < ApplicationController
  def index
    render inertia: "Home", props: {
      name: "Elisson",
      boards: [ { id: 1, title: "Backlog" }, { id: 2, title: "Doing" } ]
    }
  end
end
