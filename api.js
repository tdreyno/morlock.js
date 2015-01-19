var ResizeController = require('./controllers/resize-controller');
var BreakpointController = require('./controllers/breakpoint-controller');
var ScrollController = require('./controllers/scroll-controller');
var ElementVisibleController = require('./controllers/element-visible-controller');
var ScrollPositionController = require('./controllers/scroll-position-controller');
var StickyElementController = require('./controllers/sticky-element-controller');
var Util = require('./core/util');
var Events = require('./core/events');
var Buffer = require('./core/buffer');
var Stream = require('./core/stream');

var getResizeTracker = Util.memoize(function(options) {
  return new ResizeController(options);
});

var getScrollTracker = Util.memoize(function(options) {
  return new ScrollController(options);
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

module.exports = {
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

module.exports.Stream = Stream;
module.exports.Events = Events;
module.exports.Buffer = Buffer;
module.exports.Util = Util;
