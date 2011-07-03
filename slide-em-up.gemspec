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
  s.files            = Dir["MIT-LICENSE", "README.md", "Gemfile", "bin/*", "lib/**/*.rb", "themes/**/*"]
  s.executables      = ["slide-em-up"]
  s.require_paths    = ["lib"]
  s.rubygems_version = %q{1.3.7}
  s.add_dependency "goliath", "~>0.9"
  s.add_dependency "redcarpet", "~>1.17"
  s.add_dependency "erubis", "~>2.7"
  s.add_dependency "yajl-ruby", "~>0.8"
  s.add_dependency "albino", "~>1.3"
  s.add_development_dependency "minitest", "~>2.3"
end
