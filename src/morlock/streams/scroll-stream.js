module Stream from "morlock/core/stream";

function makeScrollEndStream(options) {
  options = options || {};
  var debounceMs = 'undefined' !== typeof options.debounceMs ? options.debounceMs : 200;

  var scrollEndStream = Stream.debounce(
    debounceMs,
    Stream.createFromEvents(window, 'scroll')
  );

  setTimeout(function() {
    window.dispatchEvent(new Event('scroll'));
  }, 1);

  return scrollEndStream;
}

export { makeScrollEndStream };
