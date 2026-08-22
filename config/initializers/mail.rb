# Integração de e-mail configurável — as chaves estão documentadas em .env.sample.
#
#   RESEND_API_KEY presente  -> entrega real via Resend (qualquer ambiente).
#   ausente + development    -> letter_opener_web, e-mails visíveis em /dev/mails.
#   ausente + test           -> :test (ActionMailer::Base.deliveries).
#
# Nenhuma chave vive no repo: sem RESEND_API_KEY o app roda inteiro, só não manda e-mail de verdade.
Rails.application.configure do
  config.action_mailer.default_options = { from: ENV.fetch("MAIL_FROM", "Trello Clone <no-reply@localhost>") }

  if ENV["RESEND_API_KEY"].present?
    Resend.api_key = ENV["RESEND_API_KEY"]
    config.action_mailer.delivery_method = :resend
  elsif Rails.env.development?
    config.action_mailer.delivery_method = :letter_opener_web
  end
end
