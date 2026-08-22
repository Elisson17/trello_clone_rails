require 'rails_helper'

RSpec.describe Users::Register do
  let(:attributes) { { name: "Ana Souza", email: "ana@example.com", password: "supersecret" } }

  it "creates the user with a personal workspace and an owner membership" do
    result = described_class.call(attributes)
    user = result.value

    expect(result).to be_success
    expect(user.owned_workspaces.sole).to have_attributes(personal: true, name: "Espaço de Ana")
    expect(user.memberships.sole).to be_owner
  end

  it "creates nothing when the user is invalid" do
    result = described_class.call(attributes.merge(email: ""))

    expect(result).to be_failure
    expect(Workspace.count).to be_zero
  end
end
