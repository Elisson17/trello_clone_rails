FactoryBot.define do
  factory :card do
    list
    association :creator, factory: :user
    sequence(:title) { |n| "Card #{n}" }
    position { 1024 }

    trait :archived do
      archived_at { Time.current }
    end

    trait :completed do
      completed_at { Time.current }
    end

    trait :overdue do
      due_at { 1.day.ago }
    end
  end
end
