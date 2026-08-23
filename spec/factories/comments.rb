FactoryBot.define do
  factory :comment do
    card
    user
    body { "Comentário de teste" }
  end
end
