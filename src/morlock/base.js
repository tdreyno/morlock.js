import ResizeController from "morlock/controllers/resize-controller";
import ScrollController from "morlock/controllers/scroll-controller";
import ElementVisibleController from "morlock/controllers/element-visible-controller";
import ScrollPositionController from "morlock/controllers/scroll-position-controller";
module ResponsiveImage from "morlock/core/responsive-image";
// import "morlock/plugins/jquery.breakpointer";
// import "morlock/plugins/jquery.scrolltracker";
// import "morlock/plugins/jquery.eventstream";
// import "morlock/plugins/jquery.morlockResize";
import { isDefined } from 'morlock/core/util';

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

export var morlock = {
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

export { ResizeController, ResponsiveImage, ScrollController, ElementVisibleController, ScrollPositionController };
