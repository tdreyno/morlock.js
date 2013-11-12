import { getViewportHeight, getRect } from "morlock/core/util";
module Stream from "morlock/core/stream";

function makeElementTrackerStream(element, scrollStream, resizeStream) {
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

export { makeElementTrackerStream };
