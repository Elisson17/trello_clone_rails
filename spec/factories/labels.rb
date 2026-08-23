FactoryBot.define do
  factory :label do
    board
    sequence(:name) { |n| "Etiqueta #{n}" }
    color { "sky" }
  end
end
