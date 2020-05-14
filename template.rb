# frozen_string_literal: true

gsub_file 'Gemfile', 'rubygems.org', 'gems.ruby-china.com'

def source_paths
  [__dir__]
end

def ask_with_default(question, color, default)
  return default unless $stdin.tty?

  question = (question.split('?') << " [#{default}]?").join
  answer = ask(question, color)
  answer.to_s.strip.empty? ? default : answer
end

def git_repo_url
  @git_repo_url ||=
    ask_with_default('Git Repo Url?', :blue, 'git@github.com:doabit/eg.git')
end

def production_hostname
  @production_hostname ||=
    ask_with_default('Production Hostname?', :blue, 'doabit.com')
end

def add_deploy
  gem_group :development do
    gem 'capistrano', require: false
    gem 'capistrano-rbenv', require: false
    gem 'capistrano-rails', require: false
    gem 'capistrano-bundler', require: false
    gem 'capistrano3-puma', require: false
  end

  # run 'bundle install'
end

if yes? 'Do you wish to use capistrano? (y/n)'
  add_deploy
  copy_file './Capfile', force: true
  template 'capistrano/deploy.rb'
  template 'capistrano/deploy/production.rb'
end

uncomment_lines 'Gemfile', /image_processing/
uncomment_lines 'Gemfile', /bcrypt/

gem 'image_processing', '~> 1.2'
gem 'bcrypt', '~> 3.1.7'

gem 'ransack'
gem 'platform_agent'
gem 'pagy'
gem 'spreadsheet_architect'
gem 'turbolinks_render'
gem 'bootstrap_form'
gem 'rails-i18n'
gem 'client_side_validations'
gem 'figaro'

gem_group :development do
  gem 'pry-rails'
  gem 'annotate'
  gem 'active_record_doctor'
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'rubocop-rails_config'
  gem 'rufo', require: false
end

gem_group :production do
  gem 'redis'
  gem 'sidekiq'
  gem 'rack-ratelimit'
  gem 'rack-timeout'
end

after_bundle do
  run 'spring stop'
  run 'yarn add jquery popper.js bootstrap@^4.2.1'\
    ' @doabit/stisla-theme@^1.1.1'\
    ' @client-side-validations/client-side-validations@^0.1.3'\
    ' chocolat@^0.4.21'\
    ' daterangepicker@^3.0.5'\
    ' dropzone@^5.7.0'\
    ' overlayscrollbars@^1.12.0'\
    ' sortablejs@^1.10.2'\
    ' @fortawesome/fontawesome-free@^5.7.2'\
    ' cleave.js@^1.4.7'\
    ' izitoast@^1.4.0'\
    ' select2@^4.0.7-rc.0'\
    ' stimulus@^1.1.1'\
    ' waypoints@^4.0.1'

  directory 'app',      './app',      force: true
  directory 'config',   './config',   force: true
  directory 'lib',      './lib',      force: true
  directory 'public',   './public',   force: true
  directory 'test',     './test',     force: true
  directory 'vendor',   './vendor',   force: true

  copy_file 'Procfile', './Procfile'

  uncomment_lines 'config/puma.rb', /WEB_CONCURRENCY/

  environment do
    <<~RUBY
      config.app                            = config_for(:config)
      config.i18n.default_locale            = 'zh-CN'
      config.time_zone                      = 'Beijing'
      config.generators.scaffold_stylesheet = false
      config.autoload_paths << Rails.root.join("lib/engines")
    RUBY
  end

  environment nil, env: 'production' do
    <<~RUBY
      # config.force_ssl = true
      # config.active_job.queue_adapter = :sidekiq
      # config.action_controller.asset_host = ENV['CLOUDFRONT_URL']
      # config.cache_store = :redis_cache_store, { url: ENV['REDIS_CACHE_URL'] }

      config.middleware.use(
        Rack::Ratelimit, name: 'API',
        conditions: ->(env) { ActionDispatch::Request.new(env).format.json? },
        rate:   [50, 10.seconds],
        redis:  Redis.new
      ) { |env| ActionDispatch::Request.new(env).ip }
    RUBY
  end
end
