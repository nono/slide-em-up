require "redcarpet"
require "yajl"


module SlideEmUp
  class Presentation
    def initialize(dir)
      @dir = dir
    end

    def html
      return @html if @html
      raw = Dir["#{@dir}/**/*.md"].map { |f| File.read(f) }.join("\n\n")
      slides = raw.split(/!SLIDE\s*/)
      slides.delete('')
      @html = slides.map do |slide|
        first_line, md = slide.split("\n", 2)
        classes = first_line == "" ? "" : " class=\"#{first_line}\""
        str = Redcarpet.new(md).to_html
        "<section#{classes}>\n#{str}\n</section>"
      end.join()
    end
  end
end
