import {
  eventStream,
  debounceStream
} from "morlock/event-stream";

function makeScrollEndStream(options) {
  options = options || {};
  var debounceMs = 'undefined' !== typeof options.debounceMs ? options.debounceMs : 200;

  var scrollEndStream = debounceStream(debounceMs, eventStream(window, 'scroll'));

  setTimeout(function() {
    window.dispatchEvent(new Event('scroll'));
  }, 1);

  return scrollEndStream;
}

export { makeScrollEndStream }
