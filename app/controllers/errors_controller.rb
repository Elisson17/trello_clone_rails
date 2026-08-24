class ErrorsController < ApplicationController
  # Mandar para o login em cima de um 500 esconderia o erro.
  skip_before_action :authenticate_user!
  skip_after_action :verify_authorized

  def show
    render_error(status)
  end

  private

  # Vem do `exceptions_app` (`/404`, `/500`) ou da rota coringa, que sempre é 404.
  def status
    code = params[:status].to_i

    ErrorRendering::STATUSES.key?(code) ? code : 404
  end
end
