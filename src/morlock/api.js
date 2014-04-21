import ResizeController from "morlock/controllers/resize-controller";
import BreakpointController from "morlock/controllers/breakpoint-controller";
import ScrollController from "morlock/controllers/scroll-controller";
import ElementVisibleController from "morlock/controllers/element-visible-controller";
import ScrollPositionController from "morlock/controllers/scroll-position-controller";
import StickyElementController from "morlock/controllers/sticky-element-controller";
module Util from 'morlock/core/util';
module Events from 'morlock/core/events';
module Buffer from "morlock/core/buffer";
module Stream from "morlock/core/stream";

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

export default = morlock;
