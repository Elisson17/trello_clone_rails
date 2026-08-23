class CreateActivitiesAndNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :activities do |t|
      t.references :board, null: false, foreign_key: true
      t.references :user, foreign_key: true
      t.references :subject, polymorphic: true, null: false
      t.string :action, null: false
      t.json :metadata, null: false, default: {}

      t.datetime :created_at, null: false
    end
    add_index :activities, %i[board_id created_at]
    add_index :activities, %i[subject_type subject_id created_at], name: "index_activities_on_subject_and_created_at"

    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.references :activity, null: false, foreign_key: true
      t.datetime :read_at

      t.timestamps
    end
    add_index :notifications, %i[user_id read_at]
    add_index :notifications, %i[activity_id user_id], unique: true
  end
end
