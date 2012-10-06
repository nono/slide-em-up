(function() {
	var doc = document;
	var disableBuilds = false;

	var ctr = 0;
	var spaces = /\s+/, a1 = [''];

	var toArray = function(list) {
	  return Array.prototype.slice.call(list || [], 0);
	};

	var byId = function(id) {
	  if (typeof id == 'string') { return doc.getElementById(id); }
	  return id;
	};

	var query = function(query, root) {
	  return queryAll(query, root)[0];
	}

	var queryAll = function(query, root) {
	  if (!query) { return []; }
	  if (typeof query != 'string') { return toArray(query); }
	  if (typeof root == 'string') {
	    root = byId(root);
	    if(!root){ return []; }
	  }

	  root = root || document;
	  var rootIsDoc = (root.nodeType == 9);
	  var doc = rootIsDoc ? root : (root.ownerDocument || document);

	  // rewrite the query to be ID rooted
	  if (!rootIsDoc || ('>~+'.indexOf(query.charAt(0)) >= 0)) {
	    root.id = root.id || ('qUnique' + (ctr++));
	    query = '#' + root.id + ' ' + query;
	  }
	  // don't choke on something like ".yada.yada >"
	  if ('>~+'.indexOf(query.slice(-1)) >= 0) { query += ' *'; }
	  return toArray(doc.querySelectorAll(query));
	};

	var strToArray = function(s) {
	  if (typeof s == 'string' || s instanceof String) {
	    if (s.indexOf(' ') < 0) {
	      a1[0] = s;
	      return a1;
	    } else {
	      return s.split(spaces);
	    }
	  }
	  return s;
	};

	// Needed for browsers that don't support String.trim() (e.g. iPad)
	var trim = function(str) {
	  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	};

	var addClass = function(node, classStr) {
	  classStr = strToArray(classStr);
	  var cls = ' ' + node.className + ' ';
	  for (var i = 0, len = classStr.length, c; i < len; ++i) {
	    c = classStr[i];
	    if (c && cls.indexOf(' ' + c + ' ') < 0) {
	      cls += c + ' ';
	    }
	  }
	  node.className = trim(cls);
	};

	var removeClass = function(node, classStr) {
	  var cls;
	  if (classStr !== undefined) {
	    classStr = strToArray(classStr);
	    cls = ' ' + node.className + ' ';
	    for (var i = 0, len = classStr.length; i < len; ++i) {
	      cls = cls.replace(' ' + classStr[i] + ' ', ' ');
	    }
	    cls = trim(cls);
	  } else {
	    cls = '';
	  }
	  if (node.className != cls) {
	    node.className = cls;
	  }
	};

	var toggleClass = function(node, classStr) {
	  var cls = ' ' + node.className + ' ';
	  if (cls.indexOf(' ' + trim(classStr) + ' ') >= 0) {
	    removeClass(node, classStr);
	  } else {
	    addClass(node, classStr);
	  }
	};


	// modernizr lite via https://gist.github.com/598008
	var testStyle = function(style) {

	  var elem = document.createElement('div');
	  var prefixes = ['Webkit', 'Moz', 'O', 'ms', 'Khtml'];
	  var bool;
	  var bump = function(all, letter) {
		return letter.toUpperCase();
	      };
	  var prop;

	  bool = style in elem.style;
	  prop = style.replace(/^(.)/, bump).replace(/-([a-z])/ig, bump);

	  for (var len = prefixes.length; len--; ){
	    if (bool) { 
	      break; 
	    }
	    bool = prefixes[len] + prop in elem.style;
	  }

	  document.documentElement.className += ' ' + (bool ? '' : 'no-') + style.replace(/-/g, '');
	  return bool;
	};

	var canTransition = testStyle('transition');

	//
	// Slide class
	//
	var Slide = function(node, idx) {
	  this._node = node;
	  if (idx >= 0) {
	    this._count = idx + 1;
	  }
	  if (this._node) {
	    addClass(this._node, 'slide distant-slide');
	  }
	  this._makeCounter();
	  this._makeBuildList();
	};

	Slide.prototype = {
	  _node: null,
	  _count: 0,
	  _buildList: [],
	  _visited: false,
	  _currentState: '',
	  _states: [ 'distant-slide', 'far-past',
		     'past', 'current', 'future',
		     'far-future', 'distant-slide' ],
	  setState: function(state) {
	    if (typeof state != 'string') {
	      state = this._states[state];
	    }
	    if (state == 'current' && !this._visited) {
	      this._visited = true;
	      this._makeBuildList();
	    }
	    removeClass(this._node, this._states);
	    addClass(this._node, state);
	    this._currentState = state;

	    // delay first auto run. Really wish this were in CSS.
	    /*
	    this._runAutos();
	    */
	    var _t = this;
	    setTimeout(function(){ _t._runAutos(); } , 400);

	    if (state == 'current') {
	      this._onLoad();
	    } else {
	      this._onUnload();
	    }
	  },
	  _onLoad: function() {
	    this._fireEvent('onload');
	    this._showFrames();
	  },
	  _onUnload: function() {
	    this._fireEvent('onunload');
	    this._hideFrames();
	  },
	  _fireEvent: function(name) {
	    var eventSrc = this._node.getAttribute(name);
	    if (eventSrc) {
	      eventSrc = '(function() { ' + eventSrc + ' })';
	      var fn = eval(eventSrc);
	      fn.call(this._node);
	    }
	  },
	  _showFrames: function() {
	    var frames = queryAll('iframe', this._node);
	    function show() {
	      frames.forEach(function(el) {
		var _src = el.getAttribute('_src');
		if (_src && _src.length) {
		  el.src = _src;
		}
	      });
	    }
	    setTimeout(show, 0);
	  },
	  _hideFrames: function() {
	    var frames = queryAll('iframe', this._node);
	    function hide() {
	      frames.forEach(function(el) {
		var _src = el.getAttribute('_src');
		if (_src && _src.length) {
		  el.src = '';
		}
	      });
	    }
	    setTimeout(hide, 250);
	  },
	  _makeCounter: function() {
	    if(!this._count || !this._node) { return; }
	    var c = doc.createElement('span');
	    c.textContent = this._count;
	    c.className = 'counter';
	    this._node.appendChild(c);
	  },
	  _makeBuildList: function() {
	    this._buildList = [];
	    if (disableBuilds) { return; }
	    if (this._node) {
	      this._buildList = queryAll('[data-build] > *', this._node);
	    }
	    this._buildList.forEach(function(el) {
	      addClass(el, 'to-build');
	    });
	  },
	  _runAutos: function() {
	    if (this._currentState != 'current') {
	      return;
	    }
	    // find the next auto, slice it out of the list, and run it
	    var idx = -1;
	    this._buildList.some(function(n, i) {
	      if (n.hasAttribute('data-auto')) {
		idx = i;
		return true;
	      }
	      return false;
	    });
	    if (idx >= 0) {
	      var elem = this._buildList.splice(idx, 1)[0];
	     
	      var _t = this;
	      if (canTransition) {
		var l = function(evt) {
		  elem.parentNode.removeEventListener('webkitTransitionEnd', l, false);
		  elem.parentNode.removeEventListener('transitionend', l, false);  // moz
		  elem.parentNode.removeEventListener('oTransitionEnd', l, false);
		  _t._runAutos();
		};
		elem.parentNode.addEventListener('webkitTransitionEnd', l, false);
		elem.parentNode.addEventListener('transitionend', l, false);
		elem.parentNode.addEventListener('oTransitionEnd', l, false);
		removeClass(elem, 'to-build');
	      } else {
		setTimeout(function() {
		  removeClass(elem, 'to-build');
		  _t._runAutos();
		}, 400);
	      }
	    }
	  },
	  buildNext: function() {
	    if (!this._buildList.length) {
	      return false;
	    }
	    removeClass(this._buildList.shift(), 'to-build');
	    return true;
	  },
	};

	//
	// SlideShow class
	//
	var SlideShow = function(slides) {
	  this._slides = (slides || []).map(function(el, idx) {
	    return new Slide(el, idx);
	  });
	  var h = window.location.hash;
	  try {
	    this.current = h;
	  } catch (e) { /* squeltch */ }
	  this.current = (!this.current) ? "landing-slide" : this.current.replace('#', '');
	  if (!query('#' + this.current)) {
	    // if this happens is very likely that someone is coming from
	    // a link with the old permalink format, i.e. #slide24
	    alert('The format of the permalinks have recently changed. If you are coming ' +
		   'here from an old external link it\'s very likely you will land to the wrong slide');
	    this.current = "landing-slide";
	  }
	  var _t = this;
	  doc.addEventListener('keydown', 
	      function(e) { _t.handleKeys(e); }, false);
	  doc.addEventListener('touchstart', 
	      function(e) { _t.handleTouchStart(e); }, false);
	  doc.addEventListener('touchend', 
	      function(e) { _t.handleTouchEnd(e); }, false);
	  window.addEventListener('popstate', 
	      function(e) { if (e.state) { _t.go(e.state); } }, false);
	  query('#left-init-key').addEventListener('click',
	      function() { _t.next(); }, false);
    window.setTimeout(function() {
      this._startEventSource('/remote/sub/events');
    }, 100);
	  this._update();
	};

	SlideShow.prototype = {
	  _presentationCounter: query('#presentation-counter'),
	  _slides: [],
	  _getCurrentIndex: function() {
	    var me = this;
	    var slideCount = null;
	    queryAll('.slide').forEach(function(slide, i) {
	      if (slide.id == me.current) {
		slideCount = i;
	      }
	    });
	    return slideCount + 1;  
	  },
    _startEventSource: function(uri) {
      if (window['EventSource'] == undefined) return ;

      var source = new EventSource(uri);
      var _t = this;
      source.onmessage = function(e) {
        switch(e.data){
          case 'next':
            _t.next(); break;
          case 'prev':
            _t.prev(); break;
          case 'up':
            _t.showNotes(); break;
          case 'down':
            _t.switch3D(); break;
          default:
            console.log(e);
        };
      };
    },
	  _update: function(dontPush) {
	    // in order to delay the time where the counter shows the slide number we check if 
	    // the slides are already loaded (so we show the loading... instead)
	    // the technique to test visibility is taken from here
	    // http://stackoverflow.com/questions/704758/how-to-check-if-an-element-is-really-visible-with-javascript
	    var docElem = document.documentElement;
	    var elem = document.elementFromPoint( docElem.clientWidth / 2, docElem.clientHeight / 2);
	    var currentIndex = this._getCurrentIndex();
	    if (elem && elem.className != 'presentation') {
		this._presentationCounter.textContent = currentIndex;
	    }
	    if (history.pushState) {
	      if (!dontPush) {
		history.replaceState(this.current, 'Slide ' + this.current, '#' + this.current);
	      }
	    } else {
	      window.location.hash = this.current;
	    }
	    for (var x = currentIndex-1; x < currentIndex + 7; x++) {
	      if (this._slides[x-4]) {
		this._slides[x-4].setState(Math.max(0, x-currentIndex));
	      }
	    }
	  },

	  current: 0,
	  next: function() {
	    if (!this._slides[this._getCurrentIndex() - 1].buildNext()) {
	      var next = query('#' + this.current + ' + .slide');
	      this.current = (next) ? next.id : this.current;
	      this._update();
	    }
	  },
	  prev: function() {
	    var prev = query('.slide:nth-child(' + (this._getCurrentIndex() - 1) + ')');
	    this.current = (prev) ? prev.id : this.current;
	    this._update();
	  },
	  go: function(slideId) {
	    this.current = slideId;
	    this._update(true);
	  },

	  _notesOn: false,
	  showNotes: function() {
	    var isOn = this._notesOn = !this._notesOn;
	    queryAll('.notes').forEach(function(el) {
	      el.style.display = (notesOn) ? 'block' : 'none';
	    });
	  },
	  switch3D: function() {
	    toggleClass(document.body, 'three-d');
	  },
	  changeTheme: function() {
	    var linkEls = queryAll('link.theme');
	    var sheetIndex = 0;
	    linkEls.forEach(function(stylesheet, i) {
	      if (!stylesheet.disabled) {
		sheetIndex = i;
	      }
	    });
	    linkEls[sheetIndex].disabled = true;
	    linkEls[(sheetIndex + 1) % linkEls.length].disabled = false;
	    sessionStorage['theme'] = linkEls[(sheetIndex + 1) % linkEls.length].href;
	  },
	  handleKeys: function(e) {
	    
	    if (/^(input|textarea)$/i.test(e.target.nodeName) || e.target.isContentEditable) {
	      return;
	    }
	    
	    switch (e.keyCode) {
	      case 37: // left arrow
		this.prev(); e.preventDefault(); break;
	      case 39: // right arrow
	      case 32: // space
		this.next(); e.preventDefault(); break;
	      case 50: // 2
		this.showNotes(); e.preventDefault(); break;
	      case 51: // 3
		this.switch3D(); e.preventDefault(); break;
	      case 84: // T
		this.changeTheme(); e.preventDefault(); break;
	    }
	  },
	  _touchStartX: 0,
	  handleTouchStart: function(e) {
	    this._touchStartX = e.touches[0].pageX;
	  },
	  handleTouchEnd: function(e) {
	    var delta = this._touchStartX - e.changedTouches[0].pageX;
	    var SWIPE_SIZE = 150;
	    if (delta > SWIPE_SIZE) {
	      this.next();
	    } else if (delta< -SWIPE_SIZE) {
	      this.prev();
	    }
	  },
	};

	// disable style theme stylesheets
	var linkEls = queryAll('link.theme');
	var stylesheetPath = sessionStorage['theme'] || 'css/default.css';
	linkEls.forEach(function(stylesheet) {
	  stylesheet.disabled = !(stylesheet.href.indexOf(stylesheetPath) != -1);
	});

	// Initialize
	var slideshow = new SlideShow(queryAll('.slide'));

	document.addEventListener('DOMContentLoaded', function() {
	  query('.slides').style.display = 'block';
	}, false);

	queryAll('pre').forEach(function(el) {
	  addClass(el, 'prettyprint');
	});

})();
