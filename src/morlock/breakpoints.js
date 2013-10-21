var EventTarget = __dependency1__.EventTarget;

import { throttle, debounce, testMQ } from "./morlock/util";

function Breakpoint(name, options, controller) {
  this.name = name;
  this.controller_ = controller;

  var mq;

  if ('undefined' !== typeof options.mq) {
    mq = options.mq;
  } else {
    options.max = ('undefined' !== typeof options.max) ? options.max : Infinity;
    options.min = ('undefined' !== typeof options.min) ? options.min : 0;

    mq = 'only screen';
    if (options.max < Infinity) {
      mq += ' and (max-width: ' + options.max + 'px)';
    }
    if (options.min > 0) {
      mq += ' and (min-width: ' + options.min + 'px)';
    }
  }

  this.mq_ = mq;
  this.active_ = false;
}

EventTarget.mixin(Breakpoint.prototype);

Breakpoint.prototype.test = function() {
  return testMQ(this.mq_);
};

Breakpoint.prototype.update = function() {
  var testResult = this.test();

  if (this.active_ && !testResult) {
    this.active_ = false;
    this.trigger('exit');
  } else if (!this.active_ && testResult) {
    this.active_ = true;
    this.trigger('enter');
  }
};

/**
 * A Controller class to centralize window width related callbacks.
 * @constructor
 * @param {Object} widths Key/values of breakpoint names and widths.
 * @param {Number} throttleMs How frequently to emit resize events.
 */
function BreakpointController(presets, throttleMs) {
  this.isWatchingResize_ = false;

  this.breakpoints_ = {};
  this.activeBreakpoints_ = {};

  var self = this;
  this.listenerFunc_ = throttle(function() {
    self.onResize_();
  }, throttleMs || 200);

  this.orientationChangeFunc_ = function() {
    setTimeout(function() {
      self.onResize_();
    }, 100);
  };

  presets = presets || {};
  for (var key in presets) {
    if (presets.hasOwnProperty(key)) {
      this.add(key, presets[key]);
    }
  }
}

EventTarget.mixin(BreakpointController.prototype);

BreakpointController.prototype.add = function(name, options) {
  this.breakpoints_[name] = new Breakpoint(name, options, this);

  var self = this;
  this.breakpoints_[name].on('enter', function() {
    self.enteredBreakpoint_(name);
  });

  this.breakpoints_[name].on('exit', function() {
    self.exitedBreakpoint_(name);
  });
};

BreakpointController.prototype.remove = function(name) {
  delete this.breakpoints_[name];
};

/**
 * Start observing window resize events.
 */
BreakpointController.prototype.watchResize = function() {
  if (this.isWatchingResize_) { return; }

  this.isWatchingResize_ = true;

  if (window.addEventListener) {
    window.addEventListener('resize', this.listenerFunc_, false);
    window.addEventListener('orientationchange', this.orientationChangeFunc_, false);
  } else if (window.attachEvent) {
    window.attachEvent('onresize', this.listenerFunc_);
  }

  this.onResize_();
};

/**
 * Stop observing window resize events.
 */
BreakpointController.prototype.stopWatchingResize = function() {
  if (!this.isWatchingResize_) { return; }

  if (window.removeEventListener) {
    window.removeEventListener('resize', this.listenerFunc_, false);
    window.removeEventListener('orientationchange', this.orientationChangeFunc_, false);
  } else if (window.detachEvent) {
    window.detachEvent('onresize', this.listenerFunc_);
  }

  this.isWatchingResize_ = false;
};

/**
 * onResize callback.
 * @private
 */
BreakpointController.prototype.onResize_ = function() {
  var foundBreakpoint;

  this.trigger('resize');

  for (var key in this.breakpoints_) {
    if (this.breakpoints_.hasOwnProperty(key)) {
      this.breakpoints_[key].update();
    }
  }
};

BreakpointController.prototype.enteredBreakpoint_ = function(name) {
  this.activeBreakpoints_[name] = this.breakpoints_[name];
  this.breakpointChanged_();
};

BreakpointController.prototype.exitedBreakpoint_ = function(name) {
  delete this.activeBreakpoints_[name];
  this.breakpointChanged_();
};

BreakpointController.prototype.breakpointChanged_ = function(name) {
  var self = this;
  this.debouncedChange_ = this.debouncedChange_ || debounce(function() {
    self.trigger('breakpointChanged', { activeBreakpoints: self.activeBreakpoints() });
  }, 200);

  this.debouncedChange_();
};

/**
 * Get the current breakpoint name.
 * @return {Array} The list of active breakpoints.
 */
BreakpointController.prototype.activeBreakpoints = function() {
  var activeBreakpoints = [];
  for (var key in this.activeBreakpoints_) {
    if (this.activeBreakpoints_.hasOwnProperty(key)) {
      activeBreakpoints.push(key);
    }
  }

  return activeBreakpoints;
};

/**
 * Check if a breakpoint is active.
 * @param {String} name Name to check if it is active.
 * @return {Boolean} Whether the breakpoint is active.
 */
BreakpointController.prototype.isBreakpointActive = function(name) {
  var activeBreakpoints = this.activeBreakpoints();

  for (var i = 0; i < activeBreakpoints.length; i++) {
    if (name === activeBreakpoints[i]) {
      return true;
    }
  }

  return false;
};

export { BreakpointController }