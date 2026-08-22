FactoryBot.define do
  factory :list do
    board
    sequence(:title) { |n| "Lista #{n}" }
    position { 1024 }

    trait :archived do
      archived_at { Time.current }
    end
  end
end
