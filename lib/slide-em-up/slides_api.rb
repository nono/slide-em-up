require "rack/utils"
require "goliath/api"


module SlideEmUp
  class SlidesAPI < Goliath::API
    use ::Rack::ContentLength

    def initialize(presentation)
      @presentation = presentation
    end

    def response(env)
      body = @presentation.html
      [200, {
        "Content-Type"   => "text/html; charset=utf-8",
        "Content-Length" => Rack::Utils.bytesize(body).to_s
      }, [body] ]
    end
  end
end
