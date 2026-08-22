module Users
  # Cadastro completo: usuário + workspace pessoal + membership owner, tudo ou nada.
  class Register < ApplicationInteractor
    def initialize(attributes)
      @user = User.new(attributes)
    end

    def call
      return failure(@user.errors) unless @user.valid?

      transaction do
        @user.save!
        workspace = Workspace.create!(name: default_workspace_name, owner: @user, personal: true)
        workspace.memberships.create!(user: @user, role: :owner)
      end

      success(@user)
    end

    attr_reader :user

    private

    def default_workspace_name
      first_name = @user.name.to_s.split.first.presence || "Meu"
      "Espaço de #{first_name}"
    end
  end
end
