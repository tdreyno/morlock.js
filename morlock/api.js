'use strict';

// var { once, memoize } = require('ramda');
var ResizeController = require('morlock/controllers/resize-controller');
var BreakpointController = require('morlock/controllers/breakpoint-controller');
var ScrollController = require('morlock/controllers/scroll-controller');
var ElementVisibleController = require('morlock/controllers/element-visible-controller');
var ScrollPositionController = require('morlock/controllers/scroll-position-controller');
var StickyElementController = require('morlock/controllers/sticky-element-controller');
var Util = require('morlock/core/util');
var Events = require('morlock/core/events');
var Buffer = require('morlock/core/buffer');
var Stream = require('morlock/core/stream');

var getResizeTracker = function(options) {
  return new ResizeController(options);
}

var getScrollTracker = function(options) {
  return new ScrollController(options);
}

var getPositionTracker = function(pos) {
  return morlock.observePosition(pos);
}

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
    var st = getResizeTracker({ debounceMs: 0 });
    return st.on('resize', cb);
  },

  onResizeEnd: function onResizeEnd(cb, options) {
    var st = getResizeTracker(options);
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

module.exports = morlock;
