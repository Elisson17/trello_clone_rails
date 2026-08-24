# A rota não aninha em card: o `checklist_id` já leva até ele para autorizar.
class ChecklistItemsController < ApplicationController
  before_action :set_item, only: %i[update destroy]

  def create
    checklist = Checklist.includes(card: { list: :board }).find(params.expect(:checklist_id))
    authorize checklist.card, :update?

    item = checklist.items.new(content: params[:content], position: checklist.items.next_position)
    item.save
    respond_with(checklist.card, item.errors)
  end

  def update
    authorize card, :update?

    @item.update(item_params)
    respond_with(card, @item.errors)
  end

  def destroy
    authorize card, :update?

    @item.destroy
    respond_with(card, nil)
  end

  private

  def set_item
    @item = ChecklistItem.includes(checklist: { card: { list: :board } }).find(params[:id])
  end

  def card = @item.checklist.card

  def item_params
    permitted = params.permit(:content, :completed)

    return permitted.slice(:content) unless permitted.key?(:completed)

    permitted.slice(:content).merge(completed_at: permitted[:completed].to_s == "true" ? Time.current : nil)
  end

  def respond_with(card, errors)
    if errors.blank?
      redirect_to card_path(card)
    else
      redirect_to card_path(card), inertia: { errors: errors }
    end
  end
end
