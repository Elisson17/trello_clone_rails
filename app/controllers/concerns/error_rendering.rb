# A tela de erro é uma página Inertia como as outras. Fica num concern porque dois lugares
# a renderizam: o `ErrorsController` (alvo do `exceptions_app` e da rota coringa) e o
# resgate de `RecordNotFound` aqui do `ApplicationController`.
module ErrorRendering
  extend ActiveSupport::Concern

  STATUSES = {
    404 => { title: "Não encontrado",
             message: "Esta página não existe, ou você não tem acesso a ela." },
    422 => { title: "Não foi possível continuar",
             message: "O navegador enviou algo que o servidor recusou. Tente de novo." },
    500 => { title: "Algo quebrou do nosso lado",
             message: "O erro foi registrado. Voltar e tentar de novo costuma resolver." }
  }.freeze

  included do
    # Registro que não existe é 404 na nossa tela em todo ambiente. Deixar a exceção subir
    # até o middleware dá a página de debug em dev e teste, e aí ninguém vê o que o usuário
    # de produção vê.
    rescue_from ActiveRecord::RecordNotFound do
      render_error(404)
    end
  end

  private

  def render_error(status)
    render inertia: "Errors/Show",
           props: STATUSES.fetch(status).merge(status: status),
           status: status
  end
end
