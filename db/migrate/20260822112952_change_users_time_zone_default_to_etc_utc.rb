class ChangeUsersTimeZoneDefaultToEtcUtc < ActiveRecord::Migration[8.1]
  def change
    change_column_default :users, :time_zone, from: "UTC", to: "Etc/UTC"
    up_only { execute "UPDATE users SET time_zone = 'Etc/UTC' WHERE time_zone = 'UTC'" }
  end
end
