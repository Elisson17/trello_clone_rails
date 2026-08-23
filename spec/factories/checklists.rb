FactoryBot.define do
  factory :checklist do
    card
    sequence(:title) { |n| "Checklist #{n}" }
    position { 1024 }
  end
end
