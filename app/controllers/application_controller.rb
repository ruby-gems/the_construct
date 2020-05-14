# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include ForgeryProtection
  include SetPlatform
  include Pagy::Backend
  after_action { pagy_headers_merge(@pagy) if @pagy }
end
