import { objectKeys, objectVals, partial, mapObject, apply, push, first,
         testMQ, eventListener, equals, compose } from "morlock/core/util";
module Stream from "morlock/core/stream";

function makeResizeStream(options) {
  options = options || {};
  var throttleMs = 'undefined' !== typeof options.throttleMs ? options.throttleMs : 200;

  // var resizedStream = Stream.merge(
  //   Stream.throttle(throttleMs, Stream.createFromEvents(window, 'resize')),
  //   Stream.delay(100, Stream.createFromEvents(window, 'orientationchange'))
  // );

  var resizedStream = Stream.throttle(throttleMs, Stream.createFromEvents(window, 'resize'));

  setTimeout(function() {
    window.dispatchEvent(new Event('resize'));
  }, 1);

  return resizedStream;
}


export { makeResizeStream }
