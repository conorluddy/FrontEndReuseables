/**
 *  Each & Other website, 2015 [www.eachandother.com]
 *  Author: Conor Luddy
 *
 *  AhhRelax
 *  ---------
 *  A bit of a plugin for effects and making things fly around the screen.
 *
 *  Basically, this gets initialised on page load, and re-initialised on 
 *  window resize. On initialisation it loops through an array of 'pieces'
 *  that we want to play with. Gets some positioning data on them, and
 *  stores them in an array of 'initialised pieces'.
 *
 *  These then get polled every x milliseconds (you set at the end),
 *  and passed into different effect functions which alter the elements
 *  CSS based on the position of the window...
 */

(function(window, document, EachAnd, $, Modernizr, undefined) {
    'use strict';

    EachAnd.util.ahhrelax = function() {

      var
      //Viewport
      vpTop = 0,
      vpBottom = 0,
      vpHeight = 0,
      vpWidth = 0,
      vpMidpoint = ((vpBottom - vpTop) / 2) + vpTop,
      //Setup fills this with individual objects we can animate
      initialisedPieces = [],
      //Other
      scrollInterval = 0,
      $window = $(window),
      $body = $('body');

      /*
       * These are the classes that get applied to each 'piece'
       */
      var viewClass = {
          //Applies to all pieces
          pieceToBeUsed: 'js-ar-piece',
          //Has never been in the viewport
          notYetBeenInView: 'js-ar-unSeen',
          //Has been in the viewport but may or may not still be
          hasBeenInView: 'js-ar-beenInView',
          //Is somewhere in view
          currentlyInView: 'js-ar-inView',
          //Is more than 50% of the way into the centre (based on midpoints - may need more accurate implementation)
          mostlyInView: 'js-ar-mostInView',
          //Is more than 50% of the way past the centre (based on midpoints - may need more accurate implementation)
          mostlyPastView: 'js-ar-mostlyPastView'
      };

      /*
       *  Targeted pieces or elements
       *  New effects can be defined for use here
       *
       *  Pieces potentially get the following useable properties:
       *  wrap
       *  rate
       *  tweak
       *  effect
       *  starts
       *  ends
       *  lasts
       *  height
       *  progressIn - 0-1, maxes out at 1 when the piece is actually taking up some vp space
       *  progressOut - 0-1, maxes out at 1 when the piece is gone from view.
       *  midpoint
       */
      var piece = [{
          wrap: '.m-statement > *',
          effect: 'popUpOnApproach',
          rate: 1,
          devices: ['large'] //If this isn't set, do it for everyone
      },{
          wrap: '.m-consultants h2',
          effect: 'popUpOnApproach',
          rate: 1,
          devices: ['large'] //If this isn't set, do it for everyone
      },{
          wrap: '.m-clients .logo img',
          effect: 'popUpOnApproach',
          rate: 1.1,
          devices: ['large'] //If this isn't set, do it for everyone
      },{
          wrap: '.m-case-study-content blockquote, .m-case-study-content figure',
          effect: 'slideInFromLeftOnApproach',
          rate: 1,
          devices: ['large'] //If this isn't set, do it for everyone
      }];



      /*
       *  Effects for assigning to our animatable pieces
       *
       * Define whatever you can think of. There's plenty of data to use.
       * New ones need to be added to the switch statement in animatePieces()
       *
       * Should comment out any you're not using too, just to save shpace.
       */
      var effect = {

          bgSlideVertical: function(piece, relativeTop) {
              //var newvalue = (relativeTop * piece.rate).toFixed(2);
              //If the rate is negative, background position should be
              //shifted up so that it can move down without leaving a gap.
              //newvalue = piece.rate < 0 ? piece.height - piece.tweak : 0;
              //$(piece.wrap).css('background-position', '0 ' + newvalue + 'px');
          },

          elementSlideVertical: function(piece, relativeTop) {
              // var newvalue = ( relativeTop * piece.rate ).toFixed( 2 );
              // newvalue -= piece.rate < 0 ? piece.height - piece.tweak : 0;
              // $( piece.wrap ).css( 'transform', 'translate3d(0,' + newvalue + 'px,0' );
          },

          fadeOutOnExit: function(piece, relativeTop) {
              var rate = piece.rate || 1;
              piece.$element.css('opacity', (1 - piece.progressOut * rate).toFixed(2));
          },

          fadeInOnApproach: function(piece, relativeTop) {
              var rate = piece.rate || 1;
              piece.$element.css('opacity', (0 + piece.progressIn * rate).toFixed(2));
          },

          popUpOnApproach: function(piece, relativeTop) {
              var rate = piece.rate || 1,
              distance = 300;
              /////
              piece.$element.css('transform', 'translate3d(0, ' + (distance - (piece.progressIn * distance * rate)) + 'px, 0)' );
          },

          slideInFromLeftOnApproach: function(piece, relativeTop) {
              var rate = piece.rate || 1,
              distance = 30;
              /////
              piece.$element.css('transform', 'translate3d(-' + (distance - (piece.progressIn * distance * rate)) + 'px, 0, 0)' );
          },

          debuggy: function(piece) {
            console.log(piece);
          }

      };






      /*
       *  Calculate some dimensions
       */
      function setup() {
          
          EachAnd.log('Setting up ahhrelax effects');

          var 
          $pw, 
          thisPiece = {};

          initialisedPieces = [];
          vpHeight = $window.height();
          vpWidth = $window.width();
          vpTop = $window.scrollTop();
          vpBottom = $window.scrollTop() + vpHeight;

          //Calculate the start and end points
          for (var i = piece.length - 1; i >= 0; i--) {
              //Piece could be a jQuery collection of elemeents, not jst one...
              $pw = $(piece[i].wrap);

              for (var j = 0; j < $pw.length; j++) {
                
                thisPiece = {};

                $.extend( thisPiece, piece[i] );

                //If this piece has specific devices to target, 
                //check the allowed devices against the current state. 
                //Else just work away and do it for everything.
                if (typeof thisPiece.devices === 'undefined' || $.inArray( EachAnd.device.state, thisPiece.devices ) !== -1) {
                  //Save a jQuery object of this element as a sibling of the other piece properties
                  thisPiece.$element = $pw.eq(j);
                  //Start of active section
                  thisPiece.starts = $pw.eq(j).offset().top;
                  //End of active section
                  thisPiece.ends = thisPiece.starts + $pw.eq(j).height();
                  //Save this so it doesn't need to calculate it every 10ms
                  thisPiece.height = $pw.eq(j).height();
                  //Ratio of section height to viewport height... has to be useful for something...
                  thisPiece.lasts = $pw.eq(j).height() / vpHeight;
                  //Add class showing that it hasn't been viewed yet
                  thisPiece.$element.addClass(viewClass.notYetBeenInView);
                  //Throw it on the pile
                  initialisedPieces.push(thisPiece);

                }

              }
          }
      }





      /*
       *  Animate
       */
      function posUpdate() {
          window.requestAnimationFrame(function() {
              setVpTop();
              animatePieces();
          });
      }



      function setVpTop() {
          
          // Viewport top
          vpTop = $window.scrollTop();
          
          // Viewport bottom
          vpBottom = vpTop + vpHeight;
      }


      /**
       * manageVisibilty
       * Set classes in response to the window position, and return 
       * true or false if the piece is in view.
       */
      function manageVisibilty(piece) {

          var
          $piece = piece.$element,
          pieceTop = piece.starts,
          pieceBot = piece.ends,
          vpMidpoint,
          pieceMidpoint,
          progressIn,
          progressOut,
          inview = pieceTop < vpBottom && pieceBot > vpTop;

          if (inview) {
              $piece.addClass(viewClass.currentlyInView);
              $piece.addClass(viewClass.hasBeenInView);
              //
              $piece.removeClass(viewClass.notYetBeenInView);
          } else {
              $piece.removeClass(viewClass.currentlyInView);
              return inview;
          }

          //Midpoint of viewport in relation to page
          vpMidpoint = ((vpBottom - vpTop) / 2) + vpTop;

          //Midpoint of targeted piece in relation to page
          pieceMidpoint = piece.midpoint = ((pieceBot - pieceTop) / 2) + pieceTop;

          //0% when it just comes into vp, 100% when midpoints match
          progressIn = piece.progressIn = 1 - ((vpMidpoint - pieceMidpoint) / vpHeight * -1) < 1 ? (1 - ((vpMidpoint - pieceMidpoint) / vpHeight * -1)).toFixed(2) : 1;

          //0% when when midpoints match, 100% when it exits vp
          progressOut = piece.progressOut = 1 - ((vpMidpoint - pieceMidpoint) / vpHeight * -1) > 1 ? (((vpMidpoint - pieceMidpoint) / vpHeight * -1) * -1).toFixed(2) : 0;

          //As piece is scrolled towards centre
          if (progressIn > 0.5) $piece.addClass(viewClass.mostlyInView);
          else $piece.removeClass(viewClass.mostlyInView);

          //As piece is scrolled beyond centre
          if (progressOut > 0.5) $piece.addClass(viewClass.mostlyPastView);
          else $piece.removeClass(viewClass.mostlyPastView);

          return inview;
      }





      /**
       * animatePieces
       */
      function animatePieces() {

        var 
        inview = false,
        pieceTop,
        pieceBot,
        relativeTop;

        for (var i = initialisedPieces.length - 1; i >= 0; i--) {

          pieceTop = initialisedPieces[i].starts;
          pieceBot = initialisedPieces[i].ends;
          inview = manageVisibilty( initialisedPieces[i] );
          
          /**
           * element is in view if it's top is less than vp bottom, 
           * and its bottom is greater than vp top
           */
          if ( inview ) {
            relativeTop = pieceTop - vpBottom;
            /**
             * If there's a value set for the effect key in the piece object,
             * then we want to kick off that effect. Pass the relevant piece
             * object to that effect (which is a function stored in the effect object).
             * Also send over the relativeTop number, but it's only used by some effects.
             */
            if( typeof( initialisedPieces[i].effect ) !== 'undefined' ) {
              effect[initialisedPieces[i].effect]( initialisedPieces[i], relativeTop );
            }
          }
        }
      }






      /*
       *  Initialise page
       */
      function init() {
          //Save necessary widths, heights, and other important factors
          setup();
          
          //Update them on window resize - does a lot of calc, hence 500ms
          $(window).on('resize', debounce(setup, 500));

          //Update the page every x
          scrollInterval = setInterval(posUpdate, 20);
      }


      return init();
  };







  //Move elsewhere
  EachAnd.util.ahhrelax();






})(this.window, this.document, this.EachAnd, jQuery, Modernizr);
