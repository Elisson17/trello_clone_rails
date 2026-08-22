FactoryBot.define do
  factory :workspace do
    sequence(:name) { |n| "Workspace #{n}" }
    association :owner, factory: :user
    personal { false }

    trait :owned do
      after(:create) { |workspace| workspace.memberships.create!(user: workspace.owner, role: :owner) }
    end

    trait :personal do
      personal { true }
    end
  end
end
