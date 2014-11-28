'use strict';

var { keys, compose } = require('ramda');
var { isTrue, select, getKey } = require('morlock/core/util');
var Stream = require('morlock/core/stream');
var BreakpointStream = require('morlock/streams/breakpoint-stream');
var Emitter = require('morlock/core/emitter');

/**
 * Provides a familiar OO-style API for tracking breakpoint events.
 * @constructor
 * @param {Object=} options The options passed to the breakpoint tracker.
 * @return {Object} The API with a `on` function to attach callbacks
 *   to breakpoint changes.
 */
function BreakpointController(options) {
  if (!(this instanceof BreakpointController)) {
    return new BreakpointController(options);
  }

  Emitter.mixin(this);

  var breakpointStream = BreakpointStream.create(options.breakpoints, {
    throttleMs: options.throttleMs,
    debounceMs: options.debounceMs
  });

  var activeBreakpoints = {};

  var self = this;
  Stream.onValue(breakpointStream, function(e) {
    activeBreakpoints[e[0]] = e[1];

    var namedState = e[1] ? 'enter' : 'exit';
    self.trigger('breakpoint', [e[0], namedState]);
    self.trigger('breakpoint:' + e[0], [e[0], namedState]);
  });

  this.getActiveBreakpoints = function getActiveBreakpoints() {
    var isActive = compose(isTrue, getKey(activeBreakpoints));
    return select(isActive, keys(activeBreakpoints));
  };
}

module.exports =BreakpointController;
