import { partial, getOption } from "morlock/core/util";
module Stream from "morlock/core/stream";
module ScrollStream from "morlock/streams/scroll-stream";
import ScrollPositionController from "morlock/controllers/scroll-position-controller";

var prefixedTransform = Modernizr.prefixed('transform');

/**
 * Ghetto Record implementation.
 */
function StickyElement(elem, container, options) {
  if (!(this instanceof StickyElement)) {
    return new StickyElement(elem, options);
  }

  options || (options = {});

  this.elem = elem;
  this.container = container;

  if (this.container.style.position.length === 0) {
    this.container.style.position = 'relative';
  }

  this.fixed = false;

  this.useTransform = Modernizr.csstransforms && getOption(options.useTransform, true);

  this.originalPosition = elem.style.position;
  this.originalZIndex = elem.style.zIndex;
  this.zIndex = getOption(options.zIndex, 1000);

  // Slow, avoid
  this.dimensions = this.elem.getBoundingClientRect();

  this.containerDimensions = this.container.getBoundingClientRect();

  this.originalTop = this.elem.offsetTop;

  this.elem.style.position = 'absolute';
  this.elem.style.top = this.originalTop + 'px';
  this.elem.style.left = this.elem.offsetLeft + 'px';
  this.elem.style.width = this.dimensions.width + 'px';

  this.spacer = document.createElement('div');
  this.spacer.className = 'stick-element-spacer';
  this.spacer.style.width = this.dimensions.width + 'px';
  this.spacer.style.height = this.dimensions.height + 'px';
  this.spacer.style.display = this.elem.style.display;
  this.spacer.style.float = this.elem.style.float;
  this.spacer.style.pointerEvents = 'none';

  this.elem.parentNode.insertBefore(this.spacer, this.elem);

  this.marginTop = getOption(options.marginTop, 0);
  var whenToStick = this.containerDimensions.top - this.marginTop;
  var topOfContainer = new ScrollPositionController(whenToStick);

  var stickyElement = this;

  topOfContainer.on('before', function() {
    unfix(stickyElement);
  });

  topOfContainer.on('after', function() {
    fix(stickyElement);
  });

  var scrollStream = ScrollStream.create();
  Stream.onValue(scrollStream, function(scrollY) {
    if (stickyElement.fixed) {
      var delta = scrollY + stickyElement.marginTop - stickyElement.containerDimensions.top;
      var newTop = delta;

      var maxTop = stickyElement.containerDimensions.height - stickyElement.dimensions.height;

      if (stickyElement.useTransform) {
        maxTop -= stickyElement.originalTop;
      } else {
        newTop += stickyElement.originalTop;
      }

      newTop = Math.min(newTop, maxTop);

      if (stickyElement.currentTop !== newTop) {
        if (stickyElement.useTransform) {
          stickyElement.elem.style[prefixedTransform] = 'translateY(' + newTop + 'px)';
        } else {
          stickyElement.elem.style.top = newTop + 'px';
        }
        stickyElement.currentTop = newTop;
      }
    }
  });
}

export function create(elem, container, options) {
  var stickyElement = new StickyElement(elem, container, options);

  return stickyElement;
}

function fix(stickyElement) {
  if (stickyElement.fixed) { return; }

  stickyElement.elem.style.position = 'absolute';
  stickyElement.elem.style.zIndex = stickyElement.zIndex;
  // stickyElement.elem.style.top = stickyElement.fixedOffsetY + 'px';
  stickyElement.fixed = true;
}

function unfix(stickyElement) {
  if (!stickyElement.fixed) { return; }

  stickyElement.elem.style.zIndex = stickyElement.originalZIndex;
  stickyElement.elem.style.top = stickyElement.originalTop;
  stickyElement.fixed = false;
}
