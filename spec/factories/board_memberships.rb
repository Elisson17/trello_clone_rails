FactoryBot.define do
  factory :board_membership do
    board
    user
    role { :member }
  end
end
