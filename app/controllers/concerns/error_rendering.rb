# Tela de erro é página Inertia como as outras. Está num concern porque dois lugares a
# renderizam: o `ErrorsController` (alvo do `exceptions_app`) e o resgate abaixo.
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
    # Sem isto, dev e teste mostram a página de debug em vez da tela do usuário.
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
