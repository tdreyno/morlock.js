import { objectKeys, objectVals, partial, mapObject, apply, push, first,
         testMQ, eventListener, equals, compose } from "morlock/core/util";
import { makeStream, eventStream, throttleStream, delayStream, mergeStreams,
         mapStream, filterStream } from "morlock/core/stream";

var EVENT_TYPES = {
  RESIZE: 0,
  BREAKPOINT: 1
};

function makeViewportStream(options) {
  options = options || {};
  var throttleMs = 'undefined' !== typeof options.throttleMs ? options.throttleMs : 200;

  var resizedStream = mergeStreams(
    throttleStream(throttleMs, eventStream(window, 'resize')),
    delayStream(100, eventStream(window, 'orientationchange'))
  );

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
  }, options.breakpoints || {});

  var breakpointEvents = apply(mergeStreams, objectVals(breakpointStreams));

  setTimeout(function() {
    window.dispatchEvent(new Event('resize'));
  }, 1);

  return mergeStreams(
    mapStream(function() {
      return [EVENT_TYPES.RESIZE, window.innerWidth, window.innerHeight];
    }, resizedStream),
    mapStream(function(v) {
      return [EVENT_TYPES.BREAKPOINT, first(v), v[1] ? 'enter' : 'exit'];
    }, breakpointEvents)
  );
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

function filterByType(stream, type) {
  var doesTypeMatch = compose(partial(equals, type), first);
  return filterStream(doesTypeMatch, stream);
}

export { makeViewportStream, EVENT_TYPES, filterByType }
