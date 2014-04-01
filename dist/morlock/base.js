define("morlock/base", 
  ["morlock/controllers/resize-controller","morlock/controllers/scroll-controller","morlock/controllers/element-visible-controller","morlock/controllers/scroll-position-controller","morlock/core/responsive-image","morlock/core/util","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __exports__) {
    "use strict";
    var ResizeController = __dependency1__["default"];
    var ScrollController = __dependency2__["default"];
    var ElementVisibleController = __dependency3__["default"];
    var ScrollPositionController = __dependency4__["default"];
    var ResponsiveImage = __dependency5__;
    // import "morlock/plugins/jquery.breakpointer";
    // import "morlock/plugins/jquery.scrolltracker";
    // import "morlock/plugins/jquery.eventstream";
    // import "morlock/plugins/jquery.morlockResize";
    var isDefined = __dependency6__.isDefined;

    var sharedTrackers = {};
    var sharedPositions = {};

    function getScrollTracker(debounceMs) {
      debounceMs = isDefined(debounceMs) ? debounceMs : 0;
      sharedTrackers[debounceMs] = sharedTrackers[debounceMs] || new ScrollController({ debounceMs: debounceMs });
      return sharedTrackers[debounceMs];
    }

    function getPositionTracker(pos) {
      sharedPositions[pos] = sharedPositions[pos] || morlock.observePosition(pos);
      return sharedPositions[pos];
    }

    var morlock = {
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
    __exports__.morlock = morlock;
    __exports__.ResizeController = ResizeController;
    __exports__.ResponsiveImage = ResponsiveImage;
    __exports__.ScrollController = ScrollController;
    __exports__.ElementVisibleController = ElementVisibleController;
    __exports__.ScrollPositionController = ScrollPositionController;
  });