import { getOption, partial } from "morlock/core/util";
import { getStyle, setStyle, setStyles, addClass, removeClass, insertBefore } from "morlock/core/dom";
module Stream from "morlock/core/stream";
module ScrollStream from "morlock/streams/scroll-stream";
import ScrollPositionController from "morlock/controllers/scroll-position-controller";

/**
 * Ghetto Record implementation.
 */
function StickyElement(elem, container) {
  if (!(this instanceof StickyElement)) {
    return new StickyElement(elem, container);
  }

  this.elem = elem;
  this.container = container;
  this.fixed = false;
  this.useTransform = true;
  this.originalZIndex = 0;
  this.zIndex = 0;
  this.elemWidth = 0;
  this.elemHeight = 0;
  this.containerTop = 0;
  this.containerHeight = 0;
  this.originalTop = 0;
  this.marginTop = 0;
  this.spacer = document.createElement('div');
}

export function create(elem, container, options) {
  var stickyElement = new StickyElement(elem, container);

  options || (options = {});

  var containerPosition = getStyle(stickyElement.container, 'position');
  if (containerPosition.length === 0) {
    setStyle(stickyElement.container, 'position', 'relative');
  }

  stickyElement.useTransform = Modernizr.csstransforms && getOption(options.useTransform, true);

  stickyElement.originalZIndex = getStyle(elem, 'zIndex');
  stickyElement.zIndex = getOption(options.zIndex, 1000);

  // Slow, avoid
  var dimensions = elem.getBoundingClientRect();
  stickyElement.elemWidth = dimensions.width;
  stickyElement.elemHeight = dimensions.height;

  var containerDimensions = container.getBoundingClientRect();
  stickyElement.containerTop = containerDimensions.top;
  stickyElement.containerHeight = containerDimensions.height;

  stickyElement.originalTop = elem.offsetTop;

  setStyles(elem, {
    'position': 'absolute',
    'top': stickyElement.originalTop + 'px',
    'left': elem.offsetLeft + 'px',
    'width': stickyElement.elemWidth + 'px'
  });

  addClass(stickyElement.spacer, 'stick-element-spacer');

  setStyles(stickyElement.spacer, {
    'width': stickyElement.elemWidth + 'px',
    'height': stickyElement.elemHeight + 'px',
    'display': getStyle(elem, 'display'),
    'float': getStyle(elem, 'float'),
    'pointerEvents': 'none'
  });

  // Insert spacer into DOM
  insertBefore(stickyElement.spacer, elem);

  stickyElement.marginTop = getOption(options.marginTop, 0);
  var whenToStick = stickyElement.containerTop - stickyElement.marginTop;
  var topOfContainer = new ScrollPositionController(whenToStick);

  topOfContainer.on('before', partial(unfix, stickyElement));
  topOfContainer.on('after', partial(fix, stickyElement));

  Stream.onValue(ScrollStream.create(), function(scrollY) {
    if (!stickyElement.fixed) { return; }

    var newTop = scrollY + stickyElement.marginTop - stickyElement.containerTop;
    var maxTop = stickyElement.containerHeight - stickyElement.elemHeight;

    if (stickyElement.useTransform) {
      maxTop -= stickyElement.originalTop;
    } else {
      newTop += stickyElement.originalTop;
    }

    newTop = Math.min(newTop, maxTop);

    if (stickyElement.currentTop !== newTop) {
      if (stickyElement.useTransform) {
        setStyle(stickyElement.elem, 'transform', 'translateY(' + newTop + 'px)');
      } else {
        setStyle(stickyElement.elem, 'top', newTop + 'px');
      }

      stickyElement.currentTop = newTop;
    }
  });

  return stickyElement;
}

function fix(stickyElement) {
  if (stickyElement.fixed) { return; }

  addClass(stickyElement.elem, 'fixed');
  setStyles(stickyElement.elem, {
    'zIndex': stickyElement.zIndex
  });

  stickyElement.fixed = true;
}

function unfix(stickyElement) {
  if (!stickyElement.fixed) { return; }

  removeClass(stickyElement.elem, 'fixed');
  setStyles(stickyElement.elem, {
    'zIndex': stickyElement.originalZIndex,
    'top': stickyElement.originalTop
  });

  stickyElement.fixed = false;
}
