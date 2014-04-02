import ResizeController from "morlock/controllers/resize-controller";
import BreakpointController from "morlock/controllers/breakpoint-controller";
import ScrollController from "morlock/controllers/scroll-controller";
import ElementVisibleController from "morlock/controllers/element-visible-controller";
import ScrollPositionController from "morlock/controllers/scroll-position-controller";
module ResponsiveImage from "morlock/core/responsive-image";
import { isDefined, equals, filter } from 'morlock/core/util';
module Events from 'morlock/core/events';
module Stream from "morlock/core/stream";

var sharedTrackers = {};
var sharedPositions = {};

var sharedBreakpointDefs = [];
var sharedBreakpointsVals = [];

function getScrollTracker(debounceMs) {
  debounceMs = isDefined(debounceMs) ? debounceMs : 0;
  sharedTrackers[debounceMs] = sharedTrackers[debounceMs] || new ScrollController({ debounceMs: debounceMs });
  return sharedTrackers[debounceMs];
}

function getPositionTracker(pos) {
  sharedPositions[pos] = sharedPositions[pos] || morlock.observePosition(pos);
  return sharedPositions[pos];
}

function getBreakpointTracker(def) {
  var found = false;
  for (var i = 0; i < sharedBreakpointDefs.length; i++) {
    if (equals(sharedBreakpointDefs[i], def)) {
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

export {
  ResizeController,
  BreakpointController,
  ResponsiveImage,
  ScrollController,
  ElementVisibleController,
  ScrollPositionController
};
