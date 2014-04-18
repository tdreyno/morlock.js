define("morlock/base", 
  ["morlock/controllers/resize-controller","morlock/controllers/breakpoint-controller","morlock/controllers/scroll-controller","morlock/controllers/element-visible-controller","morlock/controllers/scroll-position-controller","morlock/controllers/sticky-element-controller","morlock/core/responsive-image","morlock/core/util","morlock/core/events","morlock/core/buffer","morlock/core/stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __dependency11__, __exports__) {
    "use strict";
    var ResizeController = __dependency1__["default"];
    var BreakpointController = __dependency2__["default"];
    var ScrollController = __dependency3__["default"];
    var ElementVisibleController = __dependency4__["default"];
    var ScrollPositionController = __dependency5__["default"];
    var StickyElementController = __dependency6__["default"];
    var ResponsiveImage = __dependency7__;
    var Util = __dependency8__;
    var Events = __dependency9__;
    var Buffer = __dependency10__;
    var Stream = __dependency11__;

    var sharedPositions = {};
    var sharedBreakpointDefs = [];
    var sharedBreakpointsVals = [];

    var getResizeTracker = Util.memoize(function() {
      return new ResizeController();
    });

    var getScrollTracker = Util.memoize(function() {
      return new ScrollController();
    });

    function getPositionTracker(pos) {
      sharedPositions[pos] = sharedPositions[pos] || morlock.observePosition(pos);
      return sharedPositions[pos];
    }

    function getBreakpointTracker(def) {
      var found = false;
      for (var i = 0; i < sharedBreakpointDefs.length; i++) {
        if (Util.equals(sharedBreakpointDefs[i], def)) {
          found = true;
          break;
        }
      }

      if (found) {
        return sharedBreakpointsVals[i];
      } else {
        var controller = new BreakpointController(def);
        sharedBreakpointDefs.push(def);
        sharedBreakpointsVals.push(controller);
        return controller;
      }
    }

    function defineJQueryPlugins($) {
      $.fn.morlockResize = function() {
        return $(this).each(function() {
          if (this !== window) {
            // console.log('must attach event to window', this);
            return;
          }

          var $this = $(this);
          morlock.onResize(function(d) {
            $this.trigger('morlockResize', d);
          });
          morlock.onResizeEnd(function(d) {
            $this.trigger('morlockResizeEnd', d);
          });
        });
      };

      $.fn.morlockScroll = function() {
        return $(this).each(function() {
          if (this !== window) {
            // console.log('must attach event to window', this);
            return;
          }

          var $this = $(this);
          morlock.onScroll(function() {
            $this.trigger('morlockScroll');
          });
          morlock.onScrollEnd(function() {
            $this.trigger('morlockScrollEnd');
          });
        });
      };

      $.fn.morlockElementPosition = function(position) {
        return $(this).each(function() {
          if (this !== window) {
            // console.log('must attach event to window', this);
            return;
          }

          var $this = $(this);
          morlock.position.before(position, function() {
            $this.trigger('morlockElementPositionBefore', position);
          });
          morlock.position.after(position, function() {
            $this.trigger('morlockElementPositionAfter', position);
          });
        });
      };

      $.fn.morlockBreakpoint = function(options) {
        return $(this).each(function() {
          if (this !== window) {
            // console.log('must attach event to window', this);
            return;
          }

          var $this = $(this);
          var controller = new BreakpointController(options);
          controller.on('breakpoint', function(e) {
            $this.trigger('morlockBreakpoint', e);
          });
        });
      };

      $.fn.morlockElementVisible = function(options) {
        return $(this).each(function() {
          var $this = $(this);
          
          var observer = morlock.observeElement(this, options);

          observer.on('enter', function() {
            $this.trigger('morlockElementVisibleEnter');
          });
          observer.on('exit', function() {
            $this.trigger('morlockElementVisibleExit');
          });
        });
      };

      $.fn.morlockStickyElement = function(elementsSelector, options) {
        return $(this).each(function() {
          var container = this;
          $(container).find(elementsSelector).each(function() {
            $(this).data(
              'morlockStickyElementController',
              new StickyElementController(this, container, options)
            );
          });
        });
      };
    }

    var morlock = {
      onResize: function onResize(cb) {
        var st = getResizeTracker();
        return st.on('resize', cb);
      },

      onResizeEnd: function onResizeEnd(cb) {
        var st = getResizeTracker();
        return st.on('resizeEnd', cb);
      },

      onScroll: function onScroll(cb) {
        var st = getScrollTracker();
        return st.on('scroll', cb);
      },

      onScrollEnd: function onScrollEnd(cb) {
        var st = getScrollTracker();
        return st.on('scrollEnd', cb);
      },

      observeElement: function observeElement(elem, options) {
        return new ElementVisibleController(elem, options);
      },

      observePosition: function observePosition(positionY) {
        return new ScrollPositionController(positionY);
      },

      stickyElement: function stickyElement(elem, container, options) {
        return new StickyElementController(elem, container, options);
      },

      breakpoint: {
        enter: function(def, cb) {
          var controller = getBreakpointTracker({
            breakpoints: {
              singleton: def
            }
          });

          controller.on('breakpoint:singleton', function(data) {
            if (data[1] === 'enter') {
              cb(data);
            }
          });
        },

        exit: function(def, cb) {
          var controller = getBreakpointTracker({
            breakpoints: {
              singleton: def
            }
          });

          controller.on('breakpoint:singleton', function(data) {
            if (data[1] === 'exit') {
              cb(data);
            }
          });
        }
      },

      position: {
        before: function(pos, cb) {
          var observer = getPositionTracker(pos);
          return observer.on('before', cb);
        },

        after: function(pos, cb) {
          var observer = getPositionTracker(pos);
          return observer.on('after', cb);
        }
      },

      enableJQuery: function($) {
        $ || ($ = jQuery);

        if (!$) { return; }

        defineJQueryPlugins($);
      }
    };
    __exports__.morlock = morlock;
    morlock.Stream = Stream;
    morlock.Events = Events;
    morlock.Buffer = Buffer;
    morlock.Util = Util;

    __exports__.ResizeController = ResizeController;
    __exports__.BreakpointController = BreakpointController;
    __exports__.ResponsiveImage = ResponsiveImage;
    __exports__.ScrollController = ScrollController;
    __exports__.ElementVisibleController = ElementVisibleController;
    __exports__.ScrollPositionController = ScrollPositionController;
    __exports__.StickyElementController = StickyElementController;
  });