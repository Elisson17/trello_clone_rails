require 'rails_helper'

# Arrastar é a única escrita do app que dois usuários disparam no mesmo alvo ao mesmo
# tempo. Estes testes rodam com threads de verdade, então precisam de dados que a outra
# conexão enxergue: sem desligar a transação do RSpec, cada thread veria um board vazio.
RSpec.describe "concurrent moves", type: :model do
  self.use_transactional_tests = false

  let!(:board) { create(:board) }

  # Sem a transação do RSpec nada some sozinho, e sobra de uma rodada quebra a próxima
  # (e-mail duplicado no factory). Limpar tudo é mais barato que rastrear cada resíduo.
  after do
    connection = ActiveRecord::Base.connection
    connection.disable_referential_integrity do
      tables = connection.tables - %w[schema_migrations ar_internal_metadata]
      tables.each { |table| connection.execute("DELETE FROM #{table}") }
    end
  end

  # Solta as duas threads no mesmo instante. Sem a barreira, a primeira termina antes de a
  # segunda começar e o teste passaria mesmo com a corrida presente.
  def run_together(&block)
    barrier = Queue.new
    threads = Array.new(2) do |index|
      Thread.new do
        barrier.pop
        ActiveRecord::Base.connection_pool.with_connection { block.call(index) }
      end
    end
    2.times { barrier << :go }
    threads.each(&:join)
  end

  describe Cards::Move do
    it "does not give two cards the same position when both land in the same gap" do
      list = create(:list, board: board)
      create(:card, list: list, title: "âncora A", position: 1024)
      create(:card, list: list, title: "âncora B", position: 2048)
      movers = [
        create(:card, list: list, title: "mover 1", position: 3072),
        create(:card, list: list, title: "mover 2", position: 4096)
      ]

      # Índice 1 nos dois: a fresta entre as duas âncoras, disputada pelas duas threads.
      run_together { |index| described_class.call(card: movers[index], list: list, index: 1) }

      positions = list.cards.active.pluck(:position)
      expect(positions.uniq.size).to eq(positions.size)
      expect(list.cards.active.count).to eq(4)
    end

    it "keeps every card when both move into the same empty list at once" do
      origin = create(:list, board: board, position: 1024)
      target = create(:list, board: board, position: 2048)
      movers = [
        create(:card, list: origin, title: "mover 1", position: 1024),
        create(:card, list: origin, title: "mover 2", position: 2048)
      ]

      run_together { |index| described_class.call(card: movers[index], list: target, index: 0) }

      expect(target.cards.active.count).to eq(2)
      expect(origin.cards.active.count).to eq(0)
      positions = target.cards.active.pluck(:position)
      expect(positions.uniq.size).to eq(2)
    end
  end

  describe Lists::Move do
    it "does not give two lists the same position when both land in the same gap" do
      create(:list, board: board, title: "âncora A", position: 1024)
      create(:list, board: board, title: "âncora B", position: 2048)
      movers = [
        create(:list, board: board, title: "mover 1", position: 3072),
        create(:list, board: board, title: "mover 2", position: 4096)
      ]

      run_together { |index| described_class.call(list: movers[index], index: 1) }

      positions = board.lists.active.pluck(:position)
      expect(positions.uniq.size).to eq(positions.size)
      expect(board.lists.active.count).to eq(4)
    end
  end
end
