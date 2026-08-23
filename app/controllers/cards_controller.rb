class CardsController < ApplicationController
  include BoardRendering

  before_action :set_list, only: :create
  before_action :set_card, only: %i[show update destroy]

  def show
    authorize @card, :show?

    render_board(@card.list.board, card: @card, activities: activity_feed)
  end

  def create
    card = @list.cards.new
    authorize card

    result = Cards::Create.call(list: @list, creator: current_user, attributes: card_params)
    record_activity("card.created", result.value, title: result.value.title) if result.success?
    respond_to_board(@list.board, result.errors.first)
  end

  def update
    authorize @card

    record_activity("card.updated", @card, title: @card.title, fields: changed_fields) if @card.update(card_params)
    respond_to_card(@card.errors)
  end

  def destroy
    authorize @card

    @card.destroy
    record_activity("card.deleted", @card, title: @card.title)
    redirect_to board_path(@card.list.board), notice: t("cards.destroyed")
  end

  private

  # O feed do card: as atividades cujo alvo é este card. Comentário e checklist entram
  # aqui porque a atividade deles aponta para o card, não para a linha que mudou.
  def activity_feed
    pagy, activities = pagy(Activity.about(@card).recent.includes(:user), limit: 10)

    ActivityPresenter.new(activities, pagy)
  end

  def set_list
    @list = List.includes(:board).find(params[:list_id])
  end

  def set_card
    @card = Card.includes(list: :board).find(params[:id])
  end

  # O que mudou de fato: `card.updated` cobre título, descrição, prazo e capa, e o feed
  # fica mudo se o PATCH não mexeu em nada.
  def changed_fields = @card.previous_changes.keys - %w[updated_at]

  def card_params
    attributes = params.permit(:title, :description, :due_at, :cover_color)

    # Campo vazio no front quer dizer "sem valor", não string vazia: é assim que o prazo
    # e a capa são limpos, e é o que a validação de `cover_color` espera (`allow_nil`).
    %i[due_at cover_color].each { |key| attributes[key] = nil if attributes[key].blank? }
    attributes
  end

  def respond_to_board(board, errors)
    if errors.blank?
      redirect_to board_path(board)
    else
      redirect_to board_path(board), inertia: { errors: errors }
    end
  end

  # Editar campo do card acontece dentro do modal: a resposta tem que mantê-lo aberto.
  def respond_to_card(errors)
    if errors.blank?
      redirect_to card_path(@card)
    else
      redirect_to card_path(@card), inertia: { errors: errors }
    end
  end
end
