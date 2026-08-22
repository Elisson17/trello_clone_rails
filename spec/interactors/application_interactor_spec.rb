require "rails_helper"

RSpec.describe ApplicationInteractor do
  let(:interactor_class) do
    Class.new(described_class) do
      def initialize(should_fail:) = @should_fail = should_fail

      def call
        return failure("first error", "second error") if @should_fail

        success(:done)
      end
    end
  end

  context "when the interactor succeeds" do
    subject(:result) { interactor_class.call(should_fail: false) }

    it "is successful" do
      expect(result).to be_success
    end

    it "is not a failure" do
      expect(result).not_to be_failure
    end

    it "carries the returned value" do
      expect(result.value).to eq(:done)
    end

    it "has no errors" do
      expect(result.errors).to be_empty
    end
  end

  context "when the interactor fails" do
    subject(:result) { interactor_class.call(should_fail: true) }

    it "is a failure" do
      expect(result).to be_failure
    end

    it "carries no value" do
      expect(result.value).to be_nil
    end

    it "flattens the errors into a list" do
      expect(result.errors).to eq([ "first error", "second error" ])
    end
  end
end
