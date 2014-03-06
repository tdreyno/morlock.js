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
    window.dispatchEvent(new Event('scroll'));
  }, 10);

  return scrollEndStream;
}

function createFromEvents() {
  var oldScrollY;
  var scrollDirty = true;

  Stream.onValue(Stream.createFromEvents(window, 'scroll'), function() {
    scrollDirty = true;
  });

  var rAF = Stream.createFromRAF();

  var didChangeOnRAFStream = Stream.filter(function() {
    if (!scrollDirty) { return false; }
    scrollDirty = false;

    var newScrollY = window.scrollY;
    if (oldScrollY !== newScrollY) {
      oldScrollY = newScrollY;
      return true;
    }

    return false;
  }, rAF);

  return Stream.map(
    function getWindowPosition() {
      return oldScrollY;
    },
    didChangeOnRAFStream
  );
}

export { create };
