#!/usr/bin/env ruby

require "slide-em-up"
require "goliath/runner"


presentation = SlideEmUp::Presentation.new(Dir.pwd)

runner = Goliath::Runner.new(ARGV, nil)
runner.app = Rack::Builder.new do
  map '/slides' do
    use ::Rack::ContentLength
    run SlideEmUp::SlidesAPI.new(presentation)
  end
end
runner.run
