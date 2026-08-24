class BoardChannel < ApplicationCable::Channel
  # Assinar o canal é ler o board, então vale a mesma policy do `BoardsController#show`.
  def subscribed
    @board = Board.find_by(id: params[:id])

    return reject unless @board && BoardPolicy.new(current_user, @board).show?

    # Identifica a conexão, não a pessoa: a mesma pessoa em duas abas são dois `sid`.
    @sid = SecureRandom.uuid

    stream_for @board
    broadcast_presence("presence.join", sid: @sid, user: user_props)
    # Quem já estava aqui responde com o próprio estado. É assim que o recém-chegado monta
    # a lista sem o servidor guardar presença em lugar nenhum.
    broadcast_presence("presence.roll_call")
  end

  # Guarda no `@sid`, não no `@board`: numa assinatura rejeitada o board até foi
  # encontrado, e transmitir uma saída sem `sid` sujaria a lista de todo mundo.
  def unsubscribed
    broadcast_presence("presence.leave", sid: @sid) if @sid
  end

  # Chamada pelo cliente ao entrar e a cada troca de visibilidade da aba.
  def state(data)
    broadcast_presence("presence.state", sid: @sid, user: user_props, active: !!data["active"])
  end

  private

  # `by: nil` mantém a mensagem fora do caminho de recarregar payload: presença não muda
  # o board.
  def broadcast_presence(type, payload = {})
    BoardChannel.broadcast_to(@board, { type: type, by: nil }.merge(payload))
  end

  def user_props
    { id: current_user.id, name: current_user.name, avatar_url: current_user.avatar_url }
  end
end
