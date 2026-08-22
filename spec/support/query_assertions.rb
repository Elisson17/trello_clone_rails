# `assert_queries_count` é do próprio Rails (ActiveRecord::Assertions::QueryAssertions) —
# não vale escrever um contador de queries à mão.
#
# Ele complementa o Bullet em vez de repetir: o Bullet acha N+1 em qualquer lugar do
# request, mas não enxerga leitura de associação com escopo (`list.cards.active.ordered`),
# que é exatamente a forma de um presenter. Onde o contrato é "este payload custa N
# queries, não importa o tamanho", o número explícito é o que prende.
require "active_record/testing/query_assertions"

RSpec.configure do |config|
  config.include ActiveRecord::Assertions::QueryAssertions
  config.include ActiveSupport::Testing::Assertions
end
