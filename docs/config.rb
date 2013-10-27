activate :fjords do |config|
  config.username = Bundler.settings["fjords_username"]
  config.password = Bundler.settings["fjords_password"]
  config.domain = "morlockjs.com"
  config.gzip_assets = true
  config.cdn = true
end
