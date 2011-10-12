Slide'em up
===========

Slide'em up is a presentation tool. You write some slides in markdown, choose
a style and it displays it in HTML5. With a browser in full-screen, you can
make amazing presentations!


How to do your first presentation with Slide'em up?
---------------------------------------------------

1. Install slide-em-up: `gem install slide-em-up`
2. Create a directory for your presentation: `mkdir foobar && cd foobar`
3. Create a section for your slides: `mkdir main_section`
4. Write some slides: `vim main_section/slides.md`

       !SLIDE
       # My First slide #
       It's awesome

       !SLIDE
       # My second slide #
       This rocks too!

5. Write the `presentation.json` file with the metadata:

       {
         "title": "My first presentation",
         "theme": "shower",
         "sections": ["main_section"]
       }

6. Launch the tool: `slide-em-up`
7. Open your browser on http://localhost:9000/
8. Use the arrows keys to navigate between the slides


Markup for the slides
---------------------

This slides are writen in [Markdown](http://daringfireball.net/projects/markdown/syntax)
and `!SLIDE` is the indicator for a new slide.

Example:

    !SLIDE
    # Title of the first slide #
    ## A subtitle ##
    And some text...

    !SLIDE
    # Another slide #

    * a
    * bullet
    * list

    !SLIDE
    # Third slide #

    1. **bold**
    2. _italics_
    3. https://github.com/


Syntax Highlighting
-------------------

To highlight some code in your slides, you have to install
[pygments](http://pygments.org/). Then, surround your code with backticks
like this:

    ```ruby
    class Foobar
      def baz
        puts "Foobar says baz"
      end
    end
    ```


Themes
------

Several themes are available: shower, 3d_slideshow, html5rocks and CSSS.
To choose the theme for your presentation, edit the `presentation.json`
file and change the `"theme"` element.


Remote Control
--------------

When your start slide-em-up in console, a message says something like:

> Your remote key is 652df

This remote key can be used to send actions to browsers that display the
presentation. For example, this command goes to the next line:

    curl http://localhost:9000/remote/652df/next

The last part of the URL is the action and can be `next`, `prev`, `up` or
`down`.

It's also possible to force slide-em-up to use a specific remote key by
setting the `APIKEY` environment variable:

    APIKEY=foobar slide-em-up


TODO
----

* Same command line stuff than showoff
* Add a showoff theme for compatibility
* Many more themes and features


Issues or Suggestions
---------------------

Found an issue or have a suggestion? Please report it on
[Github's issue tracker](http://github.com/nono/slide-em-up/issues).

If you wants to make a pull request, please check the specs before:

    ./spec/slide-em-up_spec.rb


Credits
-------

Scott Chacon is the guy who made [ShowOff](https://github.com/schacon/showoff).
Slide'em up is only a copy of ShowOff, where sinatra was replaced by Goliath.

Themes were picked from the internet. Thanks to:

- Hakim El Hattab for 3d_slideshow
- Google for html5rocks
- Vadim Makeev for shower
- Lea Verou for CSSS

Copyright (c) 2011 Bruno Michel <bruno.michel@af83.com>
Released under the MIT license
