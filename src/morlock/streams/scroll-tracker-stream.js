module Stream from "morlock/core/stream";
module ScrollStream from "morlock/streams/scroll-stream";

/**
 * Create a new Stream containing events which fire when a position has
 * been scrolled past.
 * @param {number} targetScrollY The position we are tracking.
 * @return {Stream} The resulting stream.
 */
export function create(targetScrollY) {
  var scrollPositionStream = ScrollStream.create();
  var overTheLineStream = Stream.create();
  var pastScrollY = false;
  var firstRun = true;

  Stream.onValue(scrollPositionStream, function onScrollTrackPosition_(currentScrollY) {
    if ((firstRun || pastScrollY) && (currentScrollY < targetScrollY)) {
      pastScrollY = false;
      Stream.emit(overTheLineStream, ['before', targetScrollY]);
    } else if ((firstRun || !pastScrollY) && (currentScrollY >= targetScrollY)) {
      pastScrollY = true;
      Stream.emit(overTheLineStream, ['after', targetScrollY]);
    }

    firstRun = false;
  });

  return overTheLineStream;
}
