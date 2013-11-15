import { objectKeys, partial, equals, first, compose, isTrue, select, get,
         shift, nth } from "morlock/core/util";
module Stream from "morlock/core/stream";
module BreakpointStream from "morlock/streams/breakpoint-stream";
module ResizeStream from "morlock/streams/resize-stream";

/**
 * Provides a familiar OO-style API for tracking resize events.
 * @constructor
 * @param {Object=} options The options passed to the resize tracker.
 * @return {Object} The API with a `on` function to attach callbacks
 *   to resize events and breakpoint changes.
 */
function ResizeController(options) {
  if (!(this instanceof ResizeController)) {
    return new ResizeController(options);
  }

  options = options || {};

  var resizeStream = ResizeStream.create(options);

  var breakpointStream;
  if ('undefined' !== typeof options.breakpoints) {
    breakpointStream = BreakpointStream.create(options.breakpoints, resizeStream);
  }

  this.on = function(eventType, cb) {
    if ('resize' === eventType) {
      Stream.onValue(Stream.map(function() {
        return [window.innerWidth, window.innerHeight];
      }, resizeStream), cb);
    } else if ('breakpoint' === eventType) {
      if (breakpointStream) {
        Stream.onValue(Stream.map(function(v) {
          return [first(v), v[1] ? 'enter' : 'exit'];
        }, breakpointStream), cb);
      }
    }
  };

  var activeBreakpoints = {};

  if (breakpointStream) {
    Stream.onValue(breakpointStream, function(e) {
      activeBreakpoints[e[0]] = e[1];
    });
  }

  this.getActiveBreakpoints = function getActiveBreakpoints() {
    var isActive = compose(isTrue, partial(get, activeBreakpoints));
    return select(isActive, objectKeys(activeBreakpoints));
  };
}

export default = ResizeController;
