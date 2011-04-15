require "./lib/slide-em-up/version.rb"

Gem::Specification.new do |s|
  s.name             = "slide-em-up"
  s.version          = SlideEmUp::VERSION
  s.date             = Time.now.utc.strftime("%Y-%m-%d")
  s.homepage         = "http://github.com/nono/slide-em-up"
  s.authors          = "Bruno Michel"
  s.email            = "bruno.michel@af83.com"
  s.description      = "Slide'em up is a presentation tool that displays markdown-formatted slides"
  s.summary          = "Slide'em up is a presentation tool that displays markdown-formatted slides"
  s.extra_rdoc_files = %w(README.md)
  s.files            = Dir["MIT-LICENSE", "README.md", "Gemfile", "lib/**/*.rb", "themes/**"]
  s.require_paths    = ["lib"]
  s.rubygems_version = %q{1.3.7}
  s.add_dependency "goliath", "~>0.9"
  s.add_dependency "redcarpet", "~>1.7"
  s.add_dependency "nolate", "~>0.0"
  s.add_dependency "yajl-ruby", "~>0.8"
  s.add_development_dependency "minitest", "~>2.0"
end
