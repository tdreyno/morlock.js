module Stream from "morlock/core/stream";

/**
 * Create a new Stream containing scroll events.
 * These events can be debounced (meaning they will only emit after events have
 * ceased for X milliseconds).
 * @param {object=} options Map of optional parameters.
 * @param {number=200} options.debounceMs What rate to debounce the stream.
 * @return {Stream} The resulting stream.
 */
function create(options) {
  options = options || {};
  var debounceMs = 'undefined' !== typeof options.debounceMs ? options.debounceMs : 200;

  var scrollEndStream = Stream.debounce(
    debounceMs,
    createFromEvents()
  );

  // It's going to space, will you just give it a second!
  setTimeout(function() {
    var evObj = document.createEvent('HTMLEvents');
    evObj.initEvent( 'scroll', true, true );
    window.dispatchEvent(evObj);
  }, 10);

  return scrollEndStream;
}

function createFromEvents() {
  return Stream.map(
    function getWindowPosition() {
      return window.scrollY;
    },
    Stream.createFromEvents(window, 'scroll')
  );
}

export { create };
