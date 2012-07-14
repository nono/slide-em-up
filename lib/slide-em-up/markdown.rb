# Encoding: utf-8
require "albino"
require "redcarpet"


module SlideEmUp
  class Markdown < Redcarpet::Render::HTML
    PARSER_OPTIONS = {
      :no_intra_emphasis  => true,
      :tables             => true,
      :fenced_code_blocks => true,
      :autolink           => true,
      :strikethrough      => true,
      :superscript        => true
    }

    def self.render(text)
      text ||= ""
      markdown = Redcarpet::Markdown.new(self, PARSER_OPTIONS)
      markdown.render(text)
    end

    def block_code(code, lang)
      colorized = Albino.new(code, lang || "text").colorize(:P => "nowrap")
      "<pre><code class=\"#{lang}\">#{colorized}</code></pre>"
    end

    def strikethrough(text)
      "<s>#{text}</s>"
    end

    def normal_text(text)
      text.gsub!('« ', '«&nbsp;')
      text.gsub!(/ ([:;»!?])/, '&nbsp;\1')
      text.gsub!(' -- ', '—')
      text.gsub!('...', '…')
      text
    end

  end
end
