# Mantém a linha do registro na tabela de busca. É callback de Ruby, não trigger de SQLite:
# trigger não vai para o `schema.rb`, e aí o banco de teste nasce sem ele.
module Searchable
  extend ActiveSupport::Concern

  included do
    after_commit :sync_search_index, on: %i[create update], if: :title_previously_changed?
    after_commit :remove_from_search_index, on: :destroy
  end

  private

  def sync_search_index
    remove_from_search_index
    SearchIndex.create!(title: title, record_type: self.class.name, record_id: id)
  end

  def remove_from_search_index
    SearchIndex.where(record_type: self.class.name, record_id: id).delete_all
  end
end
