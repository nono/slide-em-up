#!/usr/bin/env ruby

require "minitest/autorun"
require "slide-em-up"


describe SlideEmUp do
  before do
    dir = File.expand_path("../example", __FILE__)
    @presentation = SlideEmUp::Presentation.new(dir)
  end


  it "has a version number" do
    SlideEmUp::VERSION.must_match /\d+\.\d+\.\d+/
  end


  describe "Building a presentation" do
    it "has a title" do
      @presentation.meta.title.must_equal "An example presentation"
    end

    it "has a theme" do
      @presentation.theme.title.must_equal "3d_slideshow"
    end

    it "has 3 sections, each one with a title" do
      @presentation.titles.length.must_equal 3
      @presentation.titles[0].must_equal "one"
      @presentation.titles[1].must_equal "two"
      @presentation.titles[2].must_equal "three"
    end
  end


  describe "Finding assets" do
    it "can find an asset in the presentation" do
      @presentation.path_for_asset("/css/reset.css").must_equal File.expand_path("../example/css/reset.css", __FILE__)
    end

    it "can find an asset in the theme" do
      @presentation.path_for_asset("/css/main.css").must_equal File.expand_path("../../themes/3d_slideshow/css/main.css", __FILE__)
    end

    it "can find an asset in common" do
      @presentation.path_for_asset("/fonts/crimson_text.ttf").must_equal File.expand_path("../../themes/common/fonts/crimson_text.ttf", __FILE__)
    end
  end


  describe "Rendering HTML" do
    before do
      @html = @presentation.html
    end

    it "has 3 sections" do
      3.times do |i|
        @html.must_match /<section id="section-#{i}">/
      end
    end

    it "has 3 slides in the first section" do
      3.times do |i|
        @html.must_match /<section id="slide-0-#{i}"/
      end
    end

    it "renders Markdown" do
      @html.must_match /<li>foo<\/li>\s*<li>bar<\/li>\s*<li>baz<\/li>/
    end

    it "renders code blocks" do
      @html.must_match /<code class="ruby">.+<\/code>/m
    end
  end
end
