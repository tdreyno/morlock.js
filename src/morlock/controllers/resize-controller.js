import { objectKeys, partial, equals, first, compose, isTrue, select, get,
         shift, nth } from "morlock/core/util";
module Stream from "morlock/core/stream";
import { makeResizeStream } from "morlock/streams/resize-stream";
import { makeBreakpointStream } from "morlock/streams/breakpoint-stream";

var ResizeController = function ResizeController(options) {
  if (!(this instanceof ResizeController)) {
    return new ResizeController(options);
  }

  options = options || {};

  var resizeStream = makeResizeStream(options);

  var breakpointStream;
  if ('undefined' !== typeof options.breakpoints) {
    breakpointStream = makeBreakpointStream(options.breakpoints, resizeStream);
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
      var eventType = first(e);

      if ('enter' === eventType) {
        activeBreakpoints[e[1]] = true;
      } else if ('exit' === eventType) {
        activeBreakpoints[e[1]] = false;
      }
    });
  }

  this.getActiveBreakpoints = function getActiveBreakpoints(activeBreakpoints) {
    var isActive = compose(isTrue, partial(get, activeBreakpoints));
    return select(isActive, objectKeys(activeBreakpoints));
  };
};

export { ResizeController };
