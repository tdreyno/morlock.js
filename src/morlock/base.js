import ResizeController from "morlock/controllers/resize-controller";
import BreakpointController from "morlock/controllers/breakpoint-controller";
import ScrollController from "morlock/controllers/scroll-controller";
import ElementVisibleController from "morlock/controllers/element-visible-controller";
import ScrollPositionController from "morlock/controllers/scroll-position-controller";
module ResponsiveImage from "morlock/core/responsive-image";
module Util from 'morlock/core/util';
module Events from 'morlock/core/events';
module Buffer from "morlock/core/buffer";
module Stream from "morlock/core/stream";

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
}

export var morlock = {
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

morlock.Stream = Stream;
morlock.Events = Events;
morlock.Buffer = Buffer;
morlock.Util = Util;

export {
  ResizeController,
  BreakpointController,
  ResponsiveImage,
  ScrollController,
  ElementVisibleController,
  ScrollPositionController
};
