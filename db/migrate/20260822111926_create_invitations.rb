class CreateInvitations < ActiveRecord::Migration[8.1]
  def change
    create_table :invitations do |t|
      t.references :workspace, null: false, foreign_key: true
      t.references :invited_by, null: false, foreign_key: { to_table: :users }
      t.string   :email_address, null: false
      t.integer  :role, null: false, default: 2
      t.string   :token, null: false
      t.datetime :expires_at, null: false
      t.datetime :accepted_at

      t.timestamps
    end
    add_index :invitations, :token, unique: true
    # Um convite pendente por e-mail por workspace; reconvidar depois de aceito continua valendo.
    add_index :invitations, %i[workspace_id email_address], unique: true, where: "accepted_at IS NULL"
  end
end
