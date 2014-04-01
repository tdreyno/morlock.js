module Stream from "morlock/core/stream";
import { getOption, memoize, dispatchEvent, defer, partial } from "morlock/core/util";

/**
 * Create a new Stream containing resize events.
 * These events can be throttled (meaning they will only emit once every X milliseconds).
 * @param {object=} options Map of optional parameters.
 * @param {number=100} options.orientationChangeDelayMs After rotation, how long do we wait to fire an event.
 * @return {Stream} The resulting stream.
 */
var create = memoize(function create_(options) {
  options = options || {};
  var orientationChangeDelayMs = getOption(options.orientationChangeDelayMs, 100);

  var resizedStream = Stream.merge(

    Stream.createFromEvents(window, 'resize'),

    // X milliseconds after an orientation change, send an event.
    Stream.delay(orientationChangeDelayMs,
                 Stream.createFromEvents(window, 'orientationchange'))
  );

  defer(partial(dispatchEvent, window, 'resize'), 10);

  return Stream.skipDuplicates(Stream.map(windowDimensions_, resizedStream));
});

function windowDimensions_() {
  return [
    window.innerWidth  || document.documentElement.clientWidth  || document.body.clientWidth,
    window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  ];
}

export { create };
