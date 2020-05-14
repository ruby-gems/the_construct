# frozen_string_literal: true

module Backend
  module ApplicationHelper
    def preview(file, options)
      variant = file.preview(options)
      main_app.rails_blob_representation_path(variant.blob.signed_id, variant.variation.key, variant.blob.filename)
    end

    def variant(file, options)
      variant = file.variant(options)
      main_app.rails_blob_representation_path(variant.blob.signed_id, variant.variation.key, variant.blob.filename)
    end

    def method_missing(method, *args, &block)
      if method.to_s.end_with?('_path', '_url')
        if main_app.respond_to?(method)
          main_app.send(method, *args)
        else
          super
        end
      else
        super
      end
    end

    def respond_to?(method)
      if method.to_s.end_with?('_path', '_url')
        if main_app.respond_to?(method)
          true
        else
          super
        end
      else
        super
      end
    end
  end
end
