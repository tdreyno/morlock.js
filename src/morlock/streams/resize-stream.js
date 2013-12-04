module Stream from "morlock/core/stream";

/**
 * Create a new Stream containing resize events.
 * These events can be throttled (meaning they will only emit once every X milliseconds).
 * @param {object=} options Map of optional parameters.
 * @param {number=200} options.throttleMs What rate to throttle the stream.
 * @param {number=100} options.orientationChangeDelayMs After rotation, how long do we wait to fire an event.
 * @return {Stream} The resulting stream.
 */
function create(options) {
  options = options || {};
  var throttleMs = 'undefined' !== typeof options.throttleMs ? options.throttleMs : 200;
  var orientationChangeDelayMs = 'undefined' !== typeof options.orientationChangeDelayMs ? options.orientationChangeDelayMs : 100;

  var resizedStream = Stream.merge(

    // Watch and throttle resize events;
    Stream.throttle(throttleMs, Stream.createFromEvents(window, 'resize')),

    // X milliseconds after an orientation change, send an event.
    Stream.delay(orientationChangeDelayMs,
                 Stream.createFromEvents(window, 'orientationchange'))
  );

  setTimeout(function() {
    window.dispatchEvent(new Event('resize'));
  }, 10);

  return resizedStream;
}


export { create };
