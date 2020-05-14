# frozen_string_literal: true

require 'sidekiq/web'

Backend::Engine.routes.draw do
  root to: 'home#index'
end

Rails.application.routes.draw do
  root 'home#index'
  mount Backend::Engine => '/admin'
  mount Sidekiq::Web => '/sidekiq'
end
