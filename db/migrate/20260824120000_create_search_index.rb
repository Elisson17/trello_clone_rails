class CreateSearchIndex < ActiveRecord::Migration[8.1]
  # Índice de busca em FTS5: uma tabela só para board e card, porque a busca global é uma
  # lista única. `record_type`/`record_id` não são indexados — servem para voltar ao
  # registro, não para casar texto.
  def up
    create_virtual_table :search_index, :fts5,
                         [ "title", "record_type UNINDEXED", "record_id UNINDEXED",
                           "tokenize='unicode61 remove_diacritics 2'" ]

    execute "INSERT INTO search_index (title, record_type, record_id) SELECT title, 'Board', id FROM boards"
    execute "INSERT INTO search_index (title, record_type, record_id) SELECT title, 'Card', id FROM cards"
  end

  def down
    drop_table :search_index
  end
end
