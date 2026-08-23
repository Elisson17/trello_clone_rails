# Tudo o que o detalhe do card precisa, numa migração: seis tabelas que só existem
# juntas — label sem card_label não serve para nada, checklist sem item também não.
class CreateCardDetails < ActiveRecord::Migration[8.1]
  def change
    create_table :labels do |t|
      t.references :board, null: false, foreign_key: true
      t.string :name, null: false
      t.string :color, null: false # token do Tailwind, não hex arbitrário

      t.timestamps
    end
    add_index :labels, %i[board_id name], unique: true

    create_table :card_labels do |t|
      t.references :card, null: false, foreign_key: true
      t.references :label, null: false, foreign_key: true
    end
    add_index :card_labels, %i[card_id label_id], unique: true

    create_table :card_assignments do |t|
      t.references :card, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
    add_index :card_assignments, %i[card_id user_id], unique: true

    create_table :checklists do |t|
      t.references :card, null: false, foreign_key: true
      t.string  :title, null: false
      t.decimal :position, precision: 16, scale: 8, null: false

      t.timestamps
    end

    create_table :checklist_items do |t|
      t.references :checklist, null: false, foreign_key: true
      t.string   :content, null: false
      t.decimal  :position, precision: 16, scale: 8, null: false
      t.datetime :completed_at

      t.timestamps
    end

    create_table :comments do |t|
      t.references :card, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text     :body, null: false
      t.datetime :edited_at

      t.timestamps
    end
  end
end
