import { getViewportHeight, getRect } from "morlock/core/util";
module Stream from "morlock/core/stream";
module ScrollStream from "morlock/streams/scroll-stream";

/**
 * Create a new Stream containing events which fire when an element has
 * entered or exited the viewport.
 * @param {Element} element The element we are tracking.
 * @param {Stream} scrollStream A stream emitting scroll events.
 * @param {Stream} resizeStream A stream emitting resize events.
 * @return {Stream} The resulting stream.
 */

function create(scrollY, scrollPositionStream) {
  scrollPositionStream = scrollPositionStream || ScrollStream.createFromEvents();
  var overTheLineStream = Stream.create();
  var pastScrollY = false;

  Stream.onValue(scrollPositionStream, function(scrollTop){
    if (pastScrollY && (scrollTop < scrollY)) {
      pastScrollY = false;
      Stream.emit(overTheLineStream, 'before');
    } else if (!pastScrollY && (scrollTop >= scrollY)) {
      pastScrollY = true;
      Stream.emit(overTheLineStream, 'after');
    }
  });

  setTimeout(function() {
    window.dispatchEvent(new Event('scroll'));
  }, 10);

  return overTheLineStream;
}

export { create };
