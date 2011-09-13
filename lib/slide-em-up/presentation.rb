require "albino"
require "digest/sha1"
require "erubis"
require "redcarpet"
require "yajl"


module SlideEmUp
  class Presentation
    Meta    = Struct.new(:title, :dir, :css, :js)
    Theme   = Struct.new(:title, :dir, :css, :js)
    Section = Struct.new(:number, :title, :slides)
    Slide   = Struct.new(:number, :classes, :markdown, :html)

    attr_accessor :meta, :theme, :common, :titles

    def initialize(dir)
      infos   = extract_normal_infos(dir) || extract_infos_from_showoff(dir) || {}
      infos   = { "title" => "No title", "theme" => "shower" }.merge(infos)
      @meta   = build_meta(infos["title"], dir)
      @theme  = build_theme(infos["theme"])
      @common = build_theme("common")
      @titles = infos["sections"]
    end

    def html
      str = File.read("#{theme.dir}/index.erb")
      Erubis::Eruby.new(str).result(:meta => meta, :theme => theme, :sections => sections)
    end

    def path_for_asset(asset)
      Dir[     "#{meta.dir}#{asset}"].first ||
        Dir[  "#{theme.dir}#{asset}"].first ||
        Dir[ "#{common.dir}#{asset}"].first ||
        Dir["#{meta.dir}/**#{asset}"].first
    end

  protected

    def extract_normal_infos(dir)
      filename = "#{dir}/presentation.json"
      return unless File.exists?(filename)
      Yajl::Parser.parse(File.read filename)
    end

    def extract_infos_from_showoff(dir)
      filename = "#{dir}/showoff.json"
      return unless File.exists?(filename)
      infos = Yajl::Parser.parse(File.read filename)
      sections = infos["sections"].map {|s| s["section"] }
      { "title" => infos["name"], "theme" => "showoff", "sections" => sections }
    end

    def build_meta(title, dir)
      Meta.new.tap do |m|
        m.title = title
        m.dir   = dir
        Dir.chdir(m.dir) do
          m.css = Dir["**/*.css"]
          m.js  = Dir["**/*.js"]
        end
      end
    end

    def build_theme(title)
      Theme.new.tap do |t|
        t.title = title
        t.dir   = File.expand_path("../../../themes/#{title}", __FILE__)
        Dir.chdir(t.dir) do
          t.css = Dir["**/*.css"]
          t.js  = Dir["**/*.js"]
        end
      end
    end

    def sections
      @titles.map.with_index do |title,i|
        raw = Dir["#{meta.dir}/#{title}/**/*.md"].sort.map { |f| File.read(f) }.join("\n\n")
        parts = raw.split(/!SLIDE */)
        parts.delete('')
        slides = parts.map.with_index do |slide,j|
          @codemap = {}
          classes, md = slide.split("\n", 2)
          tmp  = extract_code(md)
          html = Redcarpet.new(tmp).to_html
          html = process_code(html)
          Slide.new(j, classes, md, html)
        end
        Section.new(i, title, slides)
      end
    end

    # Code taken from gollum (http://github.com/github/gollum)
    def extract_code(md)
      md.gsub(/^``` ?(.+?)\r?\n(.+?)\r?\n```\r?$/m) do
        id = Digest::SHA1.hexdigest($2)
        @codemap[id] = { :lang => $1, :code => $2 }
        id
      end
    end

    def process_code(data)
      @codemap.each do |id, spec|
        lang, code = spec[:lang], spec[:code]
        if code.lines.all? { |line| line =~ /\A\r?\n\Z/ || line =~ /^(    |\t)/ }
          code.gsub!(/^(    |\t)/m, '')
        end
        output = Albino.new(code, lang).colorize(:P => "nowrap")
        data.gsub!(id, "<pre><code class=\"#{lang}\">#{output}</code></pre>")
      end
      data
    end
  end
end
