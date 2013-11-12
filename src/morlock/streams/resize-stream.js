import { objectKeys, objectVals, partial, mapObject, apply, push, first,
         testMQ, eventListener, equals, compose } from "morlock/core/util";
module Stream from "morlock/core/stream";

function create(options) {
  options = options || {};
  var throttleMs = 'undefined' !== typeof options.throttleMs ? options.throttleMs : 200;

  var resizedStream = Stream.merge(
    Stream.throttle(throttleMs, Stream.createFromEvents(window, 'resize')),
    Stream.delay(100, Stream.createFromEvents(window, 'orientationchange'))
  );

  setTimeout(function() {
    window.dispatchEvent(new Event('resize'));
  }, 1);

  return resizedStream;
}


export { create }
