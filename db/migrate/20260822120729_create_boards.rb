class CreateBoards < ActiveRecord::Migration[8.1]
  def change
    create_table :boards do |t|
      t.references :workspace, null: false, foreign_key: true
      t.references :creator, null: false, foreign_key: { to_table: :users }
      t.string   :title, null: false
      t.text     :description
      t.integer  :visibility, null: false, default: 0 # private:0 workspace:1
      t.string   :background, null: false, default: "slate"
      t.decimal  :position, precision: 16, scale: 8, null: false
      t.datetime :archived_at
      t.integer  :lists_count, null: false, default: 0

      t.timestamps
    end
    add_index :boards, %i[workspace_id archived_at]
  end
end
