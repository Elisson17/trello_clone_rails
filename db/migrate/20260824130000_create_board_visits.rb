class CreateBoardVisits < ActiveRecord::Migration[8.0]
  def change
    create_table :board_visits do |t|
      t.references :user,  null: false, foreign_key: true
      t.references :board, null: false, foreign_key: true
      t.datetime :viewed_at, null: false
      t.timestamps
    end

    add_index :board_visits, %i[user_id board_id], unique: true
    add_index :board_visits, %i[user_id viewed_at]
  end
end
