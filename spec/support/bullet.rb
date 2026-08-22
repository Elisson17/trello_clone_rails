# Detecção de N+1 com o Bullet, em vez de contar queries na mão.
#
# O helper envolve **só a ação**, nunca o setup: criar os dados pelas factories carrega
# associações e o Bullet marca esses objetos como "já resolvidos", o que esconderia o
# N+1 de verdade que vem depois.
#
#   it "..." do
#     board = create(:board)          # setup fora da janela
#     expect_no_n_plus_one { get board_path(board) }
#   end
module BulletHelpers
  def expect_no_n_plus_one
    Bullet.start_request
    yield

    return unless Bullet.notification?

    raise "Bullet encontrou N+1:\n#{Bullet.notification_collector.collection.map(&:body).join("\n")}"
  ensure
    Bullet.end_request
  end
end

RSpec.configure do |config|
  config.include BulletHelpers

  config.before(:suite) do
    Bullet.enable = true
    Bullet.bullet_logger = false
    Bullet.rails_logger = false
    Bullet.n_plus_one_query_enable = true
    # Só o N+1 interessa: "unused eager loading" e "counter cache" são opinião sobre
    # estilo, e o payload do board carrega associação de propósito.
    Bullet.unused_eager_loading_enable = false
    Bullet.counter_cache_enable = false
  end
end
