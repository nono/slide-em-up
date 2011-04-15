#!/usr/bin/env ruby

require "slide-em-up"
require "goliath/runner"


presentation = SlideEmUp::Presentation.new(Dir.pwd)

runner = Goliath::Runner.new(ARGV, nil)
runner.app = Rack::Builder.new do
  map '/slides' do run SlideEmUp::SlidesAPI.new(presentation) end
  map '/'       do run SlideEmUp::AssetsAPI.new(presentation) end
end
runner.run
