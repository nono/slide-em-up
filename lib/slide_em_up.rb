require "goliath"
require "redcarpet"

PRESENTATION_DIR = Dir.pwd


class SlideEmUp < Goliath::API
  def response(env)
    $stderr.puts "response"
    [200, { "content-type" => "text/html; charset=utf-8" },  html]
  end

  def html
    raw = Dir["#{PRESENTATION_DIR}/**/*.md"].map { |f| File.read(f) }.join("\n\n")
    slides = raw.split(/!SLIDE\s*/)
    slides.delete('')
    slides.map do |slide|
      first_line, md = slide.split("\n", 2)
      classes = first_line == "" ? "" : " class=\"#{first_line}\""
      str = Redcarpet.new(md).to_html
      "<section#{classes}>\n#{str}\n</section>"
    end.join()
  end

end
