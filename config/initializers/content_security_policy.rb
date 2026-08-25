# Be sure to restart your server when you modify this file.
#
# Rede de baixo para XSS: mesmo que alguma coisa injete markup, o navegador se recusa a
# executar script de outra origem. Vale a pena num SPA, onde quase todo estado do usuário
# vive no cliente.
Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self
    policy.font_src    :self, :data
    # `blob:` é o preview local do anexo e do avatar antes do upload terminar.
    policy.img_src     :self, :data, :blob
    policy.object_src  :none
    policy.base_uri    :self
    policy.form_action :self
    policy.frame_ancestors :none
    # Todo JS sai de um arquivo servido pelo Vite; nenhum `<script>` inline no layout.
    policy.script_src  :self
    # O Tailwind compila para arquivo, mas `style={{}}` do React vira atributo inline —
    # e atributo de estilo cai em `style-src` quando não há `style-src-attr`.
    policy.style_src   :self, :unsafe_inline
    # ActionCable: `:self` já cobre o ws de mesma origem, `wss:` é o proxy TLS na frente.
    policy.connect_src :self, :wss

    # O servidor do Vite serve os módulos de outra porta em dev, e o React Refresh injeta
    # script inline com `eval`. Nada disso existe no bundle de produção.
    if Rails.env.development?
      vite = "http://#{ViteRuby.config.host_with_port}"
      ws = "ws://#{ViteRuby.config.host_with_port}"
      policy.script_src(*policy.script_src, :unsafe_eval, :unsafe_inline, vite)
      policy.style_src(*policy.style_src, vite)
      policy.connect_src(*policy.connect_src, vite, ws)
    end

    # O `vite_typescript_tag` do teste de sistema serve o bundle de um blob.
    policy.script_src(*policy.script_src, :blob) if Rails.env.test?
  end
end
