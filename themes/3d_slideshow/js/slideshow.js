/**
 * Handles the very minimal navigation logic involved
 * in the slideshow. Including keyboard navigation, touch
 * interaction and URL history behavior.
 * 
 * Slides are given unique hash based URL's so that they can
 * be opened directly. I didn't use the HTML5 History API for 
 * this as it would have required the addition of server side 
 * rewrite rules and hence require more effort for anyone to
 * set up.
 * 
 * This component can be called from other scripts via a 
 * tiny API:
 *  ● Slideshow.navigateTo( indexh, indexv );
 *  ● Slideshow.navigateLeft();
 *  ● Slideshow.navigateRight();
 *  ● Slideshow.navigateUp();
 *  ● Slideshow.navigateDown();
 * 
 * 
 * version 0.1:
 *  ● First release
 * 
 * version 0.2:		
 *  ● Refactored code and added inline documentation
 * 	● Slides now have unique URL's
 * 	● A basic API to invoke navigation was added
 * 
 * 	
 * @author Hakim El Hattab
 * @version 0.2
 */
var Slideshow = (function(){
	
	var indexh = 0,
		indexv = 0;
	
	/**
	 * Activates the main program logic.
	 */
	function initialize() {
		document.addEventListener('keydown', onDocumentKeyDown, false);
		document.addEventListener('touchstart', onDocumentTouchStart, false);
		window.addEventListener('hashchange', onWindowHashChange, false);

		startEventSourceHandler('/remote/sub/events');
		
		// Read the initial state of the URL (hash)
		readURL();
	}

    function startEventSourceHandler (uri) {
        if (window['EventSource'] == undefined) return ;

        var source = new EventSource(uri);

        source.onmessage = function(e) {
            switch(e.data){
                case 'next':
                    Slideshow.navigateRight();
                break;
                case 'prev':
                    Slideshow.navigateLeft();
                break;
                case 'up':
                    Slideshow.navigateUp();
                break;
                case 'down':
                    Slideshow.navigateDown();
                break;
                default:
                    console.log(e);
            };
        };
    }

	/**
	 * Handler for the document level 'keydown' event.
	 * 
	 * @param {Object} event
	 */
	function onDocumentKeyDown( event ) {
		
		if( event.keyCode >= 37 && event.keyCode <= 40 ) {
			
			switch( event.keyCode ) {
				case 37: navigateLeft(); break; // left
				case 39: navigateRight(); break; // right
				case 38: navigateUp(); break; // up
				case 40: navigateDown(); break; // down
			}
			
			slide();
			
			event.preventDefault();
			
		}
	}
	
	/**
	 * Handler for the document level 'touchstart' event.
	 * 
	 * This enables very basic tap interaction for touch
	 * devices. Added mainly for performance testing of 3D
	 * transforms on iOS but was so happily surprised with
	 * how smoothly it runs so I left it in here. Apple +1
	 * 
	 * @param {Object} event
	 */
	function onDocumentTouchStart( event ) {
		
		// We're only interested in one point taps
		if (event.touches.length == 1) {
			event.preventDefault();
			
			var point = {
				x: event.touches[0].clientX,
				y: event.touches[0].clientY
			};
			
			// Define the extent of the areas that may be tapped
			// to navigate
			var wt = window.innerWidth * 0.3;
			var ht = window.innerHeight * 0.3;
			
			if( point.x < wt ) {
				navigateLeft();
			}
			else if( point.x > window.innerWidth - wt ) {
				navigateRight();
			}
			else if( point.y < ht ) {
				navigateUp();
			}
			else if( point.y > window.innerHeight - ht ) {
				navigateDown();
			}
			
			slide();
			
		}
	}
	
	
	/**
	 * Handler for the window level 'hashchange' event.
	 * 
	 * @param {Object} event
	 */
	function onWindowHashChange( event ) {
		readURL();
	}
	
	/**
	 * Updates one dimension of slides by showing the slide
	 * with the specified index.
	 * 
	 * @param {String} selector A CSS selector that will fetch
	 * the group of slides we are working with
	 * @param {uint} index The index of the slide that should be
	 * shown
	 * 
	 * @return {uint} The index of the slide that is now shown,
	 * might differ from the passed in index if it was out of 
	 * bounds.
	 */
	function updateSlides( selector, index ) {
		
		// Select all slides and convert the NodeList result to
		// an array
		var slides = Array.prototype.slice.call( document.querySelectorAll( selector ) );
		
		if( slides.length ) {
			// Enforce max and minimum index bounds
			index = Math.max(Math.min(index, slides.length - 1), 0);
			
			slides[index].setAttribute('class', 'present');
			
			// Any element previous to index is given the 'past' class
			slides.slice(0, index).map(function(element){
				element.setAttribute('class', 'past');
			});
			
			// Any element subsequent to index is given the 'future' class
			slides.slice(index + 1).map(function(element){
				element.setAttribute('class', 'future');
			});
		}
		else {
			// Since there are no slides we can't be anywhere beyond the 
			// zeroth index
			index = 0;
		}
		
		return index;
		
	}
	
	/**
	 * Updates the visual slides to represent the currently
	 * set indices. 
	 */
	function slide() {
		indexh = updateSlides( '#main>section', indexh );
		indexv = updateSlides( 'section.present>section', indexv );
		
		writeURL();
	}
	
	/**
	 * Reads the current URL (hash) and navigates accordingly.
	 */
	function readURL() {
		// Break the hash down to separate components
		var bits = window.location.hash.slice(2).split('/');
		
		// Read the index components of the hash
		indexh = bits[0] ? parseInt( bits[0] ) : 0;
		indexv = bits[1] ? parseInt( bits[1] ) : 0;
		
		navigateTo( indexh, indexv );
	}
	
	/**
	 * Updates the page URL (hash) to reflect the current
	 * navigational state. 
	 */
	function writeURL() {
		var url = '/';
		
		// Only include the minimum possible number of components in
		// the URL
		if( indexh > 0 || indexv > 0 ) url += indexh
		if( indexv > 0 ) url += '/' + indexv
		
		window.location.hash = url;
	}
	
	/**
	 * Triggers a navigation to the specified indices.
	 * 
	 * @param {uint} h The horizontal index of the slide to show
	 * @param {uint} v The vertical index of the slide to show
	 */
	function navigateTo( h, v ) {
		indexh = h === undefined ? indexh : h;
		indexv = v === undefined ? indexv : v;
		
		slide();
	}
	
	function navigateLeft() {
		indexh --;
		indexv = 0;
		slide();
	}
	function navigateRight() {
		indexh ++;
		indexv = 0;
		slide();
	}
	function navigateUp() {
		indexv --;
		slide();
	}
	function navigateDown() {
		indexv ++;
		slide();
	}
	
	// Initialize the program. Done right before returning to ensure
	// that any inline variable definitions are available to all
	// functions 
	initialize();
	
	// Expose some methods publicly
	return {
		navigateTo: navigateTo,
		navigateLeft: navigateLeft,
		navigateRight: navigateRight,
		navigateUp: navigateUp,
		navigateDown: navigateDown
	};
	
})();

