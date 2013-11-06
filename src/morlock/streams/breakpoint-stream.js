import { objectVals, partial, mapObject, apply, push,
         testMQ } from "morlock/core/util";
import { makeStream, mergeStreams, mapStream } from "morlock/core/stream";

function makeBreakpointStream(breakpoints, resizedStream) {
  var breakpointStreams = mapObject(function(val, key) {
    var s = makeStream();

    var mq = breakpointToString(val);

    resizedStream.onValue(function() {
      var wasActive = s.val();
      wasActive = 'undefined' !== typeof wasActive ? wasActive : false;

      if (wasActive !== testMQ(mq)) {
        s.emit(!wasActive);
      }
    });

    return mapStream(partial(push, [key]), s);
  }, breakpoints);

  return apply(mergeStreams, objectVals(breakpointStreams));
}

function breakpointToString(options) {
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

  return mq;
}

export { makeBreakpointStream }
