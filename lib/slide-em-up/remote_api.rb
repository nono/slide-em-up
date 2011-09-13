require "goliath/api"

module SlideEmUp
  class RemoteAPI < Goliath::API
    def initialize(key)
      # Secret token...
      @key  = key

      # Share channel between connections
      @chan = ::EM::Channel.new
    end

    def response(env)
      path_info = Rack::Utils.unescape(env['PATH_INFO'])
      slash, key, action = path_info.split('/', 3)

      # Events are public
      return stream_events(env) if 'events' == action

      # Sending events is restricted
      return forbidden unless key == @key

      @chan.push(action)
      [200, {
        "Content-Type"   => "text/plain; charset=utf-8",
        "Content-Length" => Rack::Utils.bytesize(action).to_s
      }, [action]]
    end

    def on_close(env)
      return unless env['subscription']
      env.logger.info "Stream connection closed."
      @chan.unsubscribe(env['subscription'])
    end

  protected

    def stream_events(env)
      env['subscription'] = @chan.subscribe do |msg|
        env.stream_send("data: #{msg}\n\n")
      end
      streaming_response(200, {"Content-Type" => "text/event-stream"})
    end

    def forbidden
      [403, {
        "Content-Type"   => "text/plain",
        "Content-Length" => "10"
      }, ["Forbidden\n"]]
    end
  end
end
