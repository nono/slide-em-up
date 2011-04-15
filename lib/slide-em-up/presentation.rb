require "redcarpet"
require "yajl"


module SlideEmUp
  class Presentation
    attr_accessor :dir, :meta, :views_dir

    def initialize(dir)
      @dir  = dir
      @meta = Yajl::Parser.parse(File.read("#{dir}/showoff.json"))
      @views_dir = File.expand_path("../../../views", __FILE__)
    end

    def path_for_asset(asset)
      try = "#{@views_dir}#{asset}"
      return try if File.exists? try
    end

    def html
      @html ||= layout(slides)
    end

    def layout(content)
      tmpl = File.read("#{@views_dir}/layout.tmpl")
      tmpl.gsub!("@@name@@", @meta["name"])
      tmpl.gsub!("@@content@@", content)
      tmpl
    end

    def slides
      raw = @meta["sections"].map do |section|
        subdir = section["section"]
        Dir["#{@dir}/#{subdir}/**/*.md"].sort.map { |f| File.read(f) }
      end.flatten.join("\n\n")
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
