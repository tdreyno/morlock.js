define("morlock/base", 
  ["morlock/controllers/resize-controller","morlock/controllers/scroll-controller","morlock/core/responsive-image","morlock/plugins/jquery.breakpointer","morlock/plugins/jquery.scrolltracker","morlock/plugins/jquery.eventstream","morlock/plugins/jquery.morlockResize","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
    "use strict";
    var ResizeController = __dependency1__['default'];
    var ScrollController = __dependency2__['default'];
    var ResponsiveImage = __dependency3__;

    var sharedTrackers = {};
    var sharedPositions = {};

    function getScrollTracker(debounceMs) {
      debounceMs = 'undefined' !== typeof debounceMs ? debounceMs : 0;
      sharedTrackers[debounceMs] = sharedTrackers[debounceMs] || new ScrollController({ debounceMs: debounceMs });
      return sharedTrackers[debounceMs];
    }

    function getPositionTracker(pos) {
      sharedPositions[pos] = sharedPositions[pos] || morlock.observePosition(pos);
      return sharedPositions[pos];
    }

    var morlock = {
      onScrollEnd: function onScrollEnd(cb) {
        var st = getScrollTracker();
        return st.on('scrollEnd', cb);
      },

      observeElement: function observeElement() {
        var st = getScrollTracker();
        return st.observeElement.apply(st, arguments);
      },

      observePosition: function observePosition() {
        var st = getScrollTracker();
        return st.observePosition.apply(st, arguments);
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

    __exports__.ResizeController = ResizeController;
    __exports__.ResponsiveImage = ResponsiveImage;
    __exports__.ScrollController = ScrollController;
    __exports__.morlock = morlock;
  });