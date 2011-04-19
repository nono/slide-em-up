require "time"
require "rack/utils"
require "rack/mime"
require "goliath/api"


module SlideEmUp
  class SlidesAPI < Goliath::API
    def initialize(presentation)
      @presentation = presentation
    end

    def response(env)
      path_info = Rack::Utils.unescape(env["PATH_INFO"])
      if path_info == "/"
        serve_slides
      elsif path_info.include? ".."
        unauthorized_access
      else
        serve_asset(path_info)
      end
    end

  protected

    def serve_slides
      body = @presentation.html
      [200, {
        "Content-Type"   => "text/html; charset=utf-8",
        "Content-Length" => Rack::Utils.bytesize(body).to_s
      }, [body] ]
    end

    def serve_asset(path_info)
      path = @presentation.path_for_asset(path_info)
      return page_not_found(path_info) unless path && File.readable?(path)
      body = File.read(path)
      [200, {
        "Last-Modified"  => File.mtime(path).httpdate,
        "Content-Length" => Rack::Utils.bytesize(body).to_s,
        "Content-Type"   => Rack::Mime.mime_type(File.extname(path), 'text/plain'),
      }, [body] ]
    end

    def page_not_found(path_info)
      [404, {
        "Content-Type"   => "text/plain",
        "Content-Length" => "0"
      }, ["File not found: #{path_info}\n"] ]
    end

    def unauthorized_access
      [403, {
        "Content-Type"   => "text/plain",
        "Content-Length" => "0"
      }, ["Forbidden\n"] ]
    end
  end
end
