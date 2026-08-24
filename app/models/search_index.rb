# Tabela FTS5 (ver a migration): a única coisa que ela sabe é "que texto aponta para que
# registro". Permissão, arquivamento e ordenação continuam sendo do ActiveRecord.
class SearchIndex < ApplicationRecord
  self.table_name = "search_index"
  self.primary_key = nil

  # O termo do usuário não é sintaxe de query: cada palavra vira um token entre aspas com
  # `*` no fim, que é o prefixo — "conf" acha "configuração". `rank` é a relevância do
  # próprio FTS5, então o corte pelo `limit` fica no que mais casa, não no id menor.
  def self.match(term, type:, limit: 20)
    tokens = term.to_s.scan(/[[:alnum:]]+/)
    return [] if tokens.empty?

    where(record_type: type)
      .where("search_index MATCH ?", tokens.map { |token| %("#{token}"*) }.join(" "))
      .order(Arel.sql("rank"))
      .limit(limit)
      .pluck(:record_id)
  end
end
