import { getViewportHeight, getRect } from "morlock/core/util";
module Stream from "morlock/core/stream";

/**
 * Create a new Stream containing events which fire when an element has
 * entered or exited the viewport.
 * @param {Element} element The element we are tracking.
 * @param {Stream} scrollStream A stream emitting scroll events.
 * @param {Stream} resizeStream A stream emitting resize events.
 * @return {Stream} The resulting stream.
 */
function create(element, scrollStream, resizeStream) {
  var trackerStream = Stream.create();
  var viewportHeight;
  var isVisible = false;

  function updateViewport() {
    viewportHeight = getViewportHeight();
    didUpdateViewport();
  }
  
  function didUpdateViewport() {
    var r = getRect(element);
    var inY = !!r && r.bottom >= 0 && r.top <= viewportHeight;

    if (isVisible && !inY) {
      isVisible = false;
      trackerStream.emit('exit');
    } else if (!isVisible && inY) {
      isVisible = true;
      trackerStream.emit('enter');
    }
  }

  Stream.onValue(scrollStream, didUpdateViewport);
  Stream.onValue(resizeStream, updateViewport);
  updateViewport();

  return trackerStream;
}

export { create };
