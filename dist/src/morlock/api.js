define("morlock/api", 
  ["morlock/controllers/resize-controller","morlock/controllers/breakpoint-controller","morlock/controllers/scroll-controller","morlock/controllers/element-visible-controller","morlock/controllers/scroll-position-controller","morlock/controllers/sticky-element-controller","morlock/core/util","morlock/core/events","morlock/core/buffer","morlock/core/stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __exports__) {
    "use strict";
    var ResizeController = __dependency1__["default"];
    var BreakpointController = __dependency2__["default"];
    var ScrollController = __dependency3__["default"];
    var ElementVisibleController = __dependency4__["default"];
    var ScrollPositionController = __dependency5__["default"];
    var StickyElementController = __dependency6__["default"];
    var Util = __dependency7__;
    var Events = __dependency8__;
    var Buffer = __dependency9__;
    var Stream = __dependency10__;

    var getResizeTracker = Util.memoize(function() {
      return new ResizeController();
    });

    var getScrollTracker = Util.memoize(function() {
      return new ScrollController();
    });

    var getPositionTracker = Util.memoize(function(pos) {
      return morlock.observePosition(pos);
    });

    var sharedBreakpointDefs = [];
    var sharedBreakpointsVals = [];
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
      }
    };

    morlock.Stream = Stream;
    morlock.Events = Events;
    morlock.Buffer = Buffer;
    morlock.Util = Util;

    __exports__["default"] = morlock;
  });