import { getViewportHeight, getRect } from "morlock/core/util";
import { makeStream } from "morlock/core/stream";

function makeElementTrackerStream(element, scrollStream, resizeStream) {
  var trackerStream = makeStream();
  var viewportHeight;;
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

  scrollStream.onValue(didUpdateViewport);
  resizeStream.onValue(updateViewport);
  updateViewport();

  return trackerStream;
}

export { makeElementTrackerStream }
