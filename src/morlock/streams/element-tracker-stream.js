import { getViewportHeight, getRect, getOption } from "morlock/core/util";
module Stream from "morlock/core/stream";
module ScrollStream from "morlock/streams/scroll-stream";
module ResizeStream from "morlock/streams/resize-stream";

/**
 * Create a new Stream containing events which fire when an element has
 * entered or exited the viewport.
 * @param {Element} element The element we are tracking.
 * @param {object} options Key/value options
 * @return {Stream} The resulting stream.
 */
export function create(element, resizeStream, options) {
  var trackerStream = Stream.create();
  var viewportHeight;
  var isVisible = false;

  options = options || {};
  var buffer = getOption(options.buffer, 0);

  function updateViewport() {
    viewportHeight = getViewportHeight();
    didUpdateViewport();
  }
  
  function didUpdateViewport(currentScrollY) {
    var r = getRect(element, buffer, currentScrollY);
    var inY = !!r && r.bottom >= 0 && r.top < viewportHeight;

    if (isVisible && !inY) {
      isVisible = false;
      Stream.emit(trackerStream, 'exit');
    } else if (!isVisible && inY) {
      isVisible = true;
      Stream.emit(trackerStream, 'enter');
    }
  }

  Stream.onValue(ScrollStream.create(), didUpdateViewport);
  Stream.onValue(ResizeStream.create(), updateViewport);
  updateViewport();

  return trackerStream;
}
