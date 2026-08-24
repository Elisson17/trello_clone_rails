# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_08_24_120000) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "activities", force: :cascade do |t|
    t.string "action", null: false
    t.integer "board_id", null: false
    t.datetime "created_at", null: false
    t.json "metadata", default: {}, null: false
    t.integer "subject_id", null: false
    t.string "subject_type", null: false
    t.integer "user_id"
    t.index ["board_id", "created_at"], name: "index_activities_on_board_id_and_created_at"
    t.index ["board_id"], name: "index_activities_on_board_id"
    t.index ["subject_type", "subject_id", "created_at"], name: "index_activities_on_subject_and_created_at"
    t.index ["subject_type", "subject_id"], name: "index_activities_on_subject"
    t.index ["user_id"], name: "index_activities_on_user_id"
  end

  create_table "board_memberships", force: :cascade do |t|
    t.integer "board_id", null: false
    t.datetime "created_at", null: false
    t.integer "role", default: 1, null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["board_id", "user_id"], name: "index_board_memberships_on_board_id_and_user_id", unique: true
    t.index ["board_id"], name: "index_board_memberships_on_board_id"
    t.index ["user_id"], name: "index_board_memberships_on_user_id"
  end

  create_table "boards", force: :cascade do |t|
    t.datetime "archived_at"
    t.string "background", default: "slate", null: false
    t.datetime "created_at", null: false
    t.integer "creator_id", null: false
    t.text "description"
    t.integer "lists_count", default: 0, null: false
    t.decimal "position", precision: 16, scale: 8, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.integer "visibility", default: 0, null: false
    t.integer "workspace_id", null: false
    t.index ["creator_id"], name: "index_boards_on_creator_id"
    t.index ["workspace_id", "archived_at"], name: "index_boards_on_workspace_id_and_archived_at"
    t.index ["workspace_id"], name: "index_boards_on_workspace_id"
  end

  create_table "card_assignments", force: :cascade do |t|
    t.integer "card_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["card_id", "user_id"], name: "index_card_assignments_on_card_id_and_user_id", unique: true
    t.index ["card_id"], name: "index_card_assignments_on_card_id"
    t.index ["user_id"], name: "index_card_assignments_on_user_id"
  end

  create_table "card_labels", force: :cascade do |t|
    t.integer "card_id", null: false
    t.integer "label_id", null: false
    t.index ["card_id", "label_id"], name: "index_card_labels_on_card_id_and_label_id", unique: true
    t.index ["card_id"], name: "index_card_labels_on_card_id"
    t.index ["label_id"], name: "index_card_labels_on_label_id"
  end

  create_table "cards", force: :cascade do |t|
    t.datetime "archived_at"
    t.integer "comments_count", default: 0, null: false
    t.datetime "completed_at"
    t.string "cover_color"
    t.datetime "created_at", null: false
    t.integer "creator_id", null: false
    t.text "description"
    t.datetime "due_at"
    t.integer "list_id", null: false
    t.decimal "position", precision: 16, scale: 8, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["creator_id"], name: "index_cards_on_creator_id"
    t.index ["due_at"], name: "index_cards_on_due_at"
    t.index ["list_id", "position"], name: "index_cards_on_list_id_and_position"
    t.index ["list_id"], name: "index_cards_on_list_id"
  end

  create_table "checklist_items", force: :cascade do |t|
    t.integer "checklist_id", null: false
    t.datetime "completed_at"
    t.string "content", null: false
    t.datetime "created_at", null: false
    t.decimal "position", precision: 16, scale: 8, null: false
    t.datetime "updated_at", null: false
    t.index ["checklist_id"], name: "index_checklist_items_on_checklist_id"
  end

  create_table "checklists", force: :cascade do |t|
    t.integer "card_id", null: false
    t.datetime "created_at", null: false
    t.decimal "position", precision: 16, scale: 8, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["card_id"], name: "index_checklists_on_card_id"
  end

  create_table "comments", force: :cascade do |t|
    t.text "body", null: false
    t.integer "card_id", null: false
    t.datetime "created_at", null: false
    t.datetime "edited_at"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["card_id"], name: "index_comments_on_card_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "invitations", force: :cascade do |t|
    t.datetime "accepted_at"
    t.datetime "created_at", null: false
    t.string "email_address", null: false
    t.datetime "expires_at", null: false
    t.integer "invited_by_id", null: false
    t.integer "role", default: 2, null: false
    t.string "token", null: false
    t.datetime "updated_at", null: false
    t.integer "workspace_id", null: false
    t.index ["invited_by_id"], name: "index_invitations_on_invited_by_id"
    t.index ["token"], name: "index_invitations_on_token", unique: true
    t.index ["workspace_id", "email_address"], name: "index_invitations_on_workspace_id_and_email_address", unique: true, where: "accepted_at IS NULL"
    t.index ["workspace_id"], name: "index_invitations_on_workspace_id"
  end

  create_table "labels", force: :cascade do |t|
    t.integer "board_id", null: false
    t.string "color", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["board_id", "name"], name: "index_labels_on_board_id_and_name", unique: true
    t.index ["board_id"], name: "index_labels_on_board_id"
  end

  create_table "lists", force: :cascade do |t|
    t.datetime "archived_at"
    t.integer "board_id", null: false
    t.integer "cards_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.decimal "position", precision: 16, scale: 8, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["board_id", "position"], name: "index_lists_on_board_id_and_position"
    t.index ["board_id"], name: "index_lists_on_board_id"
  end

  create_table "memberships", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "role", default: 2, null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.integer "workspace_id", null: false
    t.index ["user_id"], name: "index_memberships_on_user_id"
    t.index ["workspace_id", "user_id"], name: "index_memberships_on_workspace_id_and_user_id", unique: true
    t.index ["workspace_id"], name: "index_memberships_on_workspace_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.integer "activity_id", null: false
    t.datetime "created_at", null: false
    t.datetime "read_at"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["activity_id", "user_id"], name: "index_notifications_on_activity_id_and_user_id", unique: true
    t.index ["activity_id"], name: "index_notifications_on_activity_id"
    t.index ["user_id", "read_at"], name: "index_notifications_on_user_id_and_read_at"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "confirmation_sent_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "created_at", null: false
    t.datetime "current_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.datetime "last_sign_in_at"
    t.string "last_sign_in_ip"
    t.string "name", null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.integer "sign_in_count", default: 0, null: false
    t.string "time_zone", default: "Etc/UTC", null: false
    t.string "unconfirmed_email"
    t.datetime "updated_at", null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "workspaces", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.integer "owner_id", null: false
    t.boolean "personal", default: false, null: false
    t.string "slug", null: false
    t.datetime "updated_at", null: false
    t.index ["owner_id"], name: "index_workspaces_on_owner_id"
    t.index ["slug"], name: "index_workspaces_on_slug", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "activities", "boards"
  add_foreign_key "activities", "users"
  add_foreign_key "board_memberships", "boards"
  add_foreign_key "board_memberships", "users"
  add_foreign_key "boards", "users", column: "creator_id"
  add_foreign_key "boards", "workspaces"
  add_foreign_key "card_assignments", "cards"
  add_foreign_key "card_assignments", "users"
  add_foreign_key "card_labels", "cards"
  add_foreign_key "card_labels", "labels"
  add_foreign_key "cards", "lists"
  add_foreign_key "cards", "users", column: "creator_id"
  add_foreign_key "checklist_items", "checklists"
  add_foreign_key "checklists", "cards"
  add_foreign_key "comments", "cards"
  add_foreign_key "comments", "users"
  add_foreign_key "invitations", "users", column: "invited_by_id"
  add_foreign_key "invitations", "workspaces"
  add_foreign_key "labels", "boards"
  add_foreign_key "lists", "boards"
  add_foreign_key "memberships", "users"
  add_foreign_key "memberships", "workspaces"
  add_foreign_key "notifications", "activities"
  add_foreign_key "notifications", "users"
  add_foreign_key "workspaces", "users", column: "owner_id"

  # Virtual tables defined in this database.
  # Note that virtual tables may not work with other database engines. Be careful if changing database.
  create_virtual_table "search_index", "fts5", ["title", "record_type UNINDEXED", "record_id UNINDEXED", "tokenize='unicode61 remove_diacritics 2'"]
end
