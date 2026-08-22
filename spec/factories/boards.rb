FactoryBot.define do
  factory :board do
    workspace
    association :creator, factory: :user
    sequence(:title) { |n| "Board #{n}" }
    background { "slate" }
    visibility { :workspace_wide }
    position { 1024 }

    trait :archived do
      archived_at { Time.current }
    end

    trait :private_board do
      visibility { :private_to_members }
    end

    # Estado real do app: quem cria vira admin do board.
    trait :with_admin do
      after(:create) { |board| board.board_memberships.create!(user: board.creator, role: :admin) }
    end
  end
end
