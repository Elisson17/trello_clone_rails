FactoryBot.define do
  factory :activity do
    board
    user
    subject { board }
    action { "board.updated" }
    metadata { { "title" => "Board de teste" } }
  end
end
