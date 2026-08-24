FactoryBot.define do
  factory :board_visit do
    user
    board
    viewed_at { Time.current }
  end
end
