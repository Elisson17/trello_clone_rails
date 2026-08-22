FactoryBot.define do
  factory :membership do
    workspace
    user
    role { :member }
  end
end
