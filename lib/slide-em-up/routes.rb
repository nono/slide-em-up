require "rack/builder"


module SlideEmUp
  class Routes

    def self.run(presentation, opts = {})
      Rack::Builder.new do
        map '/remote' do
          run SlideEmUp::RemoteAPI.new(opts[:remote_key])
        end

        map '/' do
          run SlideEmUp::SlidesAPI.new(presentation)
        end
      end
    end

  end
end
