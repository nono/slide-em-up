require "goliath/api"


module SlideEmUp
  class SlidesAPI < Goliath::API
    use ::Rack::ContentLength

    def initialize(presentation)
      @presentation = presentation
    end

    def response(env)
      [200, { "content-type" => "text/html; charset=utf-8" },  @presentation.html]
    end
  end
end
