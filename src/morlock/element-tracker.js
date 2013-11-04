import { getViewportHeight, getRect } from "morlock/util";

function ElementTracker(element) {
  this.element_ = element;
  this.isVisible_ = false;
  this.viewportHeight_ = getViewportHeight();
}

// jQuery-style event function names.
// makeEventable(ElementTracker.prototype, {
//   'listen': 'on',
//   'unlisten': 'off',
//   'emit': 'trigger',
// });

ElementTracker.prototype.updateViewportHeight = function(viewportHeight) {
  h = viewportHeight;
  this.updateViewport();
};

ElementTracker.prototype.updateViewport = function() {
  var r = getRect(this.element_);
  var inY = !!r && r.bottom >= 0 && r.top <= this.viewportHeight_;

  if (this.isVisible_ && !inY) {
    this.isVisible_ = false;
    this.trigger('exit');
  } else if (!this.isVisible_ && inY) {
    this.isVisible_ = true;
    this.trigger('enter');
  }
};

export { ElementTracker }
