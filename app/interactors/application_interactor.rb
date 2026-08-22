class ApplicationInteractor
  Result = Struct.new(:ok, :value, :errors, keyword_init: true) do
    def success? = ok
    def failure? = !ok
  end

  def self.call(...) = new(...).call

  private
    def success(value = nil) = Result.new(ok: true, value: value, errors: [])

    def failure(*errors) = Result.new(ok: false, value: nil, errors: errors.flatten)

    def transaction(&) = ApplicationRecord.transaction(&)
end
