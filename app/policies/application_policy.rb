class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index? = false
  def show? = false
  def create? = false
  def update? = false
  def destroy? = false

  class Scope
    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve = raise NotImplementedError, "You must define #resolve in #{self.class}"

    private

    attr_reader :user, :scope
  end

  private

  def membership_in(workspace)
    return nil if user.nil? || workspace.nil?

    @membership_in ||= {}
    @membership_in[workspace.id] ||= workspace.membership_for(user)
  end
end
