require "time"
require "rack/utils"
require "rack/mime"
require "goliath/api"


module SlideEmUp
  class AssetsAPI < Goliath::API
    def initialize(presentation)
      @presentation = presentation
    end

    def response(env)
      path_info = Rack::Utils.unescape(env["PATH_INFO"])
      path = @presentation.path_for_asset(path_info)
      if path_info == "/"
        [302, {
          "Location"       => "http://#{env["HTTP_HOST"]}/slides",
          "Content-Length" => "0"
        }, [] ]
      elsif path_info.include? ".."
        [403, {
          "Content-Type"   => "text/plain",
          "Content-Length" => "0"
        }, ["Forbidden\n"] ]
      elsif path
        body = File.read(path)
        [200, {
          "Last-Modified"  => File.mtime(path).httpdate,
          "Content-Length" => Rack::Utils.bytesize(body).to_s,
          "Content-Type"   => Rack::Mime.mime_type(File.extname(path), 'text/plain'),
        }, [body] ]
      else
        [404, {
          "Content-Type"   => "text/plain",
          "Content-Length" => "0"
        }, ["File not found: #{path_info}\n"] ]
      end
    end
  end
end
