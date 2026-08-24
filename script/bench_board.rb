# Medição do cache do payload do board: tempo de `BoardsController#show` com o cache
# frio e com o cache quente, no board mais cheio do banco de desenvolvimento.
#
#   bin/rails runner script/bench_board.rb
#
# Request de verdade, não só o presenter: a sessão é criada pelo mesmo POST /users/sign_in
# que o navegador faz. `benchmark` saiu das gems padrão no Ruby 4, daí o `CLOCK_MONOTONIC`.
raise "Só em desenvolvimento." unless Rails.env.development?

RUNS = 5

def elapsed_ms
  started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  yield
  (Process.clock_gettime(Process::CLOCK_MONOTONIC) - started) * 1000
end

user = User.find_by!(email: "demo@example.com")
board = Board.all.max_by { |candidate| candidate.cards.count }
raise "Rode bin/rails db:seed primeiro." if board.nil?

# Contado antes do primeiro request: o integration session limpa o `ExecutionContext`, e
# sem ele o `query_log_tags` de desenvolvimento estoura em qualquer query solta depois.
summary = "Board ##{board.id} — #{board.lists.count} listas, #{board.cards.count} cards"

session = ActionDispatch::Integration::Session.new(Rails.application)
# O host authorization do Rails só libera localhost em desenvolvimento; o padrão do
# integration session é www.example.com, que volta 403 antes de chegar no controller.
session.host! "localhost"

# O login é o mesmo do navegador, CSRF incluído: o token sai da meta tag da própria tela.
session.get "/users/sign_in"
token = session.response.body[/name="csrf-token" content="([^"]+)"/, 1]

session.post "/users/sign_in",
             params: { user: { email: user.email, password: "supersecret" },
                       authenticity_token: token }
raise "Login falhou (#{session.response.status})." unless session.response.status.in?([ 302, 303 ])

path = "/boards/#{board.id}"
session.get(path) # descarta o primeiro: é autoload de código, não medição
raise "GET #{path} deu #{session.response.status}." unless session.response.status == 200

# O `Rails.cache.clear` roda dentro do executor: fora dele o `query_log_tags` de
# desenvolvimento não tem contexto e estoura na primeira query.
cold = Array.new(RUNS) do
  Rails.application.executor.wrap { Rails.cache.clear }
  elapsed_ms { session.get(path) }
end
warm = Array.new(RUNS) { elapsed_ms { session.get(path) } }

average = ->(times) { (times.sum / times.size).round(1) }

puts summary
puts "Cache frio:   #{average[cold]} ms"
puts "Cache quente: #{average[warm]} ms"
