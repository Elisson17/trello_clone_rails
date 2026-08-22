InertiaRails.configure do |config|
  # Protocolo 4.x: `errors` sempre presente nos props, então o front nunca checa undefined.
  config.always_include_errors_hash = true
end
