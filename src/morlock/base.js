import ResizeController from "morlock/controllers/resize-controller";
import ScrollController from "morlock/controllers/scroll-controller";
module ResponsiveImage from "morlock/core/responsive-image";
import "morlock/plugins/jquery.breakpointer";
import "morlock/plugins/jquery.scrolltracker";
import "morlock/plugins/jquery.eventstream";
import "morlock/plugins/jquery.morlockResize";

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

export { ResizeController, ResponsiveImage, ScrollController, morlock };