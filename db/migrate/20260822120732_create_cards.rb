class CreateCards < ActiveRecord::Migration[8.1]
  def change
    create_table :cards do |t|
      t.references :list, null: false, foreign_key: true
      t.references :creator, null: false, foreign_key: { to_table: :users }
      t.string   :title, null: false
      t.text     :description
      t.decimal  :position, precision: 16, scale: 8, null: false
      t.datetime :due_at
      t.datetime :completed_at
      t.datetime :archived_at
      t.string   :cover_color
      t.integer  :comments_count, null: false, default: 0

      t.timestamps
    end
    add_index :cards, %i[list_id position]
    add_index :cards, :due_at
  end
end
