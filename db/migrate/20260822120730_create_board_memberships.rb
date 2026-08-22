class CreateBoardMemberships < ActiveRecord::Migration[8.1]
  def change
    create_table :board_memberships do |t|
      t.references :board, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :role, null: false, default: 1 # admin:0 member:1 viewer:2

      t.timestamps
    end
    add_index :board_memberships, %i[board_id user_id], unique: true
  end
end
