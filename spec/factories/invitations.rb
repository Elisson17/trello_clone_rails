FactoryBot.define do
  factory :invitation do
    workspace
    association :invited_by, factory: :user
    sequence(:email_address) { |n| "convidado#{n}@example.com" }
    role { :member }

    trait :expired do
      expires_at { 1.day.ago }
    end

    trait :accepted do
      accepted_at { Time.current }
    end
  end
end
