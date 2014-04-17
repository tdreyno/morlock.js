import { getOption, partial } from "morlock/core/util";
import { getStyle, setStyle, setStyles, addClass, removeClass, insertBefore } from "morlock/core/dom";
module Stream from "morlock/core/stream";
module ScrollStream from "morlock/streams/scroll-stream";
import ScrollPositionController from "morlock/controllers/scroll-position-controller";

function StickyElementController(elem, container, options) {
  if (!(this instanceof StickyElementController)) {
    return new StickyElementController(elem, container, options);
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

  options || (options = {});

  var containerPosition = getStyle(this.container, 'position');
  if (containerPosition.length === 0) {
    setStyle(this.container, 'position', 'relative');
  }

  this.useTransform = Modernizr.csstransforms && getOption(options.useTransform, true);

  this.originalZIndex = getStyle(elem, 'zIndex');
  this.zIndex = getOption(options.zIndex, 1000);

  // Slow, avoid
  var dimensions = elem.getBoundingClientRect();
  this.elemWidth = dimensions.width;
  this.elemHeight = dimensions.height;

  var containerDimensions = container.getBoundingClientRect();
  this.containerTop = containerDimensions.top;
  this.containerHeight = containerDimensions.height;

  this.originalTop = elem.offsetTop;

  setStyles(elem, {
    'position': 'absolute',
    'top': this.originalTop + 'px',
    'left': elem.offsetLeft + 'px',
    'width': this.elemWidth + 'px'
  });

  addClass(this.spacer, 'stick-element-spacer');

  setStyles(this.spacer, {
    'width': this.elemWidth + 'px',
    'height': this.elemHeight + 'px',
    'display': getStyle(elem, 'display'),
    'float': getStyle(elem, 'float'),
    'pointerEvents': 'none'
  });

  // Insert spacer into DOM
  insertBefore(this.spacer, elem);

  this.marginTop = getOption(options.marginTop, 0);
  var whenToStick = this.containerTop - this.marginTop;
  var topOfContainer = new ScrollPositionController(whenToStick);

  topOfContainer.on('before', partial(unfix, this));
  topOfContainer.on('after', partial(fix, this));

  Stream.onValue(ScrollStream.create(), partial(onScroll, this));
}

function onScroll(controller, scrollY) {
  if (!controller.fixed) { return; }

  var newTop = scrollY + controller.marginTop - controller.containerTop;
  var maxTop = controller.containerHeight - controller.elemHeight;

  if (controller.useTransform) {
    maxTop -= controller.originalTop;
  } else {
    newTop += controller.originalTop;
  }

  newTop = Math.min(newTop, maxTop);

  if (controller.currentTop !== newTop) {
    if (controller.useTransform) {
      setStyle(controller.elem, 'transform', 'translateY(' + newTop + 'px)');
    } else {
      setStyle(controller.elem, 'top', newTop + 'px');
    }

    controller.currentTop = newTop;
  }
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

export default = StickyElementController;
