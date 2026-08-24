# Tabela FTS5 (ver a migration). Ela só sabe que texto aponta para que registro:
# permissão e arquivamento continuam no ActiveRecord.
class SearchIndex < ApplicationRecord
  self.table_name = "search_index"
  self.primary_key = nil

  # O termo do usuário não é sintaxe de query: cada palavra vira um token entre aspas com
  # `*` no fim, então "conf" acha "configuração". `rank` é a relevância do próprio FTS5.
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
