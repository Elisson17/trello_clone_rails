FactoryBot.define do
  factory :checklist_item do
    checklist
    sequence(:content) { |n| "Item #{n}" }
    position { 1024 }

    trait :completed do
      completed_at { Time.current }
    end
  end
end
