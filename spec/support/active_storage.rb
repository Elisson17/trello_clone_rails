# As transactional fixtures desfazem o banco, mas não apagam o que foi para o disco:
# cada spec que anexa um avatar deixa um arquivo em tmp/storage. DatabaseCleaner não
# resolveria isso — é arquivo, não linha —, então limpamos o serviço no fim da suíte.
RSpec.configure do |config|
  config.after(:suite) do
    service = ActiveStorage::Blob.service
    FileUtils.rm_rf(service.root) if service.respond_to?(:root)
  end
end
