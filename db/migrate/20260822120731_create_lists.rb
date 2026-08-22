class CreateLists < ActiveRecord::Migration[8.1]
  def change
    create_table :lists do |t|
      t.references :board, null: false, foreign_key: true
      t.string   :title, null: false
      t.decimal  :position, precision: 16, scale: 8, null: false
      t.datetime :archived_at
      t.integer  :cards_count, null: false, default: 0

      t.timestamps
    end
    add_index :lists, %i[board_id position]
  end
end
