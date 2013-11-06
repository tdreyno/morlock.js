import { objectKeys, objectVals, partial, mapObject, apply, push, first,
         testMQ, eventListener, equals, compose } from "morlock/core/util";
import { makeStream, eventStream, throttleStream, delayStream, mergeStreams,
         mapStream, filterStream } from "morlock/core/stream";

function makeResizeStream(options) {
  options = options || {};
  var throttleMs = 'undefined' !== typeof options.throttleMs ? options.throttleMs : 200;

  var resizedStream = mergeStreams(
    throttleStream(throttleMs, eventStream(window, 'resize')),
    delayStream(100, eventStream(window, 'orientationchange'))
  );

  setTimeout(function() {
    window.dispatchEvent(new Event('resize'));
  }, 1);

  return resizedStream;
}


export { makeResizeStream }
