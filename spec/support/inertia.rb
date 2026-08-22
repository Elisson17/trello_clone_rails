module InertiaHelpers
  def inertia_props(response)
    page = if response.media_type == "application/json"
      JSON.parse(response.body)
    else
      JSON.parse(Nokogiri::HTML(response.body).at_css("#app")["data-page"])
    end

    page["props"]
  end
end

RSpec.configure { |config| config.include InertiaHelpers, type: :request }
