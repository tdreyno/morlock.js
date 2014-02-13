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
function create(targetScrollY, scrollPositionStream) {
  scrollPositionStream = scrollPositionStream || ScrollStream.create({ debounceMs: 0 });
  var overTheLineStream = Stream.create();
  var pastScrollY = false;
  var firstRun = true;

  Stream.onValue(scrollPositionStream, function(){
    if ((firstRun || pastScrollY) && (window.scrollY < targetScrollY)) {
      pastScrollY = false;
      Stream.emit(overTheLineStream, ['before', targetScrollY]);
    } else if ((firstRun || !pastScrollY) && (window.scrollY >= targetScrollY)) {
      pastScrollY = true;
      Stream.emit(overTheLineStream, ['after', targetScrollY]);
    }

    firstRun = false;
  });

  setTimeout(function() {
    window.dispatchEvent(new Event('scroll'));
  }, 10);

  return overTheLineStream;
}

export { create };
