var Util = require('../core/util');
var DOM = require('../core/dom');
var ResizeController = require('../controllers/resize-controller');
var ElementVisibleController = require('../controllers/element-visible-controller');
var Emitter = require('../core/emitter');

/**
 * Ghetto Record implementation.
 */
function ResponsiveImage() {
  if (!(this instanceof ResponsiveImage)) {
    return new ResponsiveImage();
  }

  this.element = null;
  this.loadedSizes = {};
  this.knownSizes = [];
  this.currentBreakpoint = null;
  this.src = null;
  this.isFlexible = false;
  this.hasRetina = false;
  this.preserveAspectRatio = false;
  this.knownDimensions = null;
  this.hasLoaded = false;
  this.hasRunOnce = false;
}

function create(imageMap) {
  var image = new ResponsiveImage();
  image.getPath = Util.getOption(imageMap.getPath, getPath);

  Util.mapObject(Util.flip(Util.set(image)), imageMap);

  if (image.knownDimensions && image.preserveAspectRatio) {
    applyAspectRatioPadding(image);
  }

  if (image.lazyLoad) {
    image.observer = new ElementVisibleController(
      image.element,
      {
        scrollTarget: imageMap.getScrollTarget(image.element)
      }
    );

    image.observer.on('enter', function onEnter_() {
      if (!image.checkIfVisible(image)) { return; }

      image.observer.off('enter', onEnter_);

      image.lazyLoad = false;
      update(image);
    });
  }

  var controller = new ResizeController({
    debounceMs: Util.getOption(imageMap.debounceMs, 200)
  });

  controller.on('resizeEnd', Util.partial(update, image));

  Emitter.mixin(image);

  return image;
}

function createFromElement(elem, options) {
  options || (options = {});

  var imageMap = {
    element: elem,
    src: Util.getOption(options.src, elem.getAttribute('data-src')),
    lazyLoad: Util.getOption(options.lazyLoad, elem.getAttribute('data-lazyload') === 'true'),
    isFlexible: Util.getOption(options.isFlexible, elem.getAttribute('data-isFlexible') !== 'false'),
    hasRetina: Util.getOption(options.hasRetina, (elem.getAttribute('data-hasRetina') === 'true') && (window.devicePixelRatio > 1.5)),
    preserveAspectRatio: Util.getOption(options.preserveAspectRatio, elem.getAttribute('data-preserveAspectRatio') === 'true'),
    checkIfVisible: Util.getOption(options.checkIfVisible, function() {
      return true;
    }),
    getScrollTarget: Util.getOption(options.getScrollTarget, function() {
      return window;
    })
  };

  if ('function' === typeof options.getPath) {
    imageMap.getPath = options.getPath;
  }

  imageMap.knownDimensions = Util.getOption(options.knownDimensions, function() {
    var dimensionsString = elem.getAttribute('data-knownDimensions');
    if (dimensionsString && (dimensionsString !== 'false')) {
      return [
        Util.parseInteger(dimensionsString.split('x')[0]),
        Util.parseInteger(dimensionsString.split('x')[1])
      ];
    }
  }, true);

  imageMap.knownSizes = getBreakpointSizes(elem);

  if (imageMap.knownDimensions && imageMap.preserveAspectRatio) {
    applyAspectRatioPadding(imageMap);
  }

  return create(imageMap);
}

/**
 * Set a padding percentage which allows the image to scale proportionally.
 * @param {ResponsiveImage} image The image data.
 */
function applyAspectRatioPadding(image) {
  var ratioPadding = (image.knownDimensions[1] / image.knownDimensions[0]) * 100.0;
  DOM.setStyle(image.element, 'paddingBottom', ratioPadding + '%');
}

/**
 * Parse the breakpoints = require(the `data-breakpoints` attribute.
 * @param {Element} element The source element.
 * @return {Array} Sorted array of known sizes.
 */
function getBreakpointSizes(element) {
  var breakpointString = element.getAttribute('data-breakpoints');

  var knownSizes = Util.map(function(s) {
    return Util.parseInteger(s);
  }, breakpointString ? breakpointString.split(',') : []);

  if (knownSizes.length <= 0) {
    return [0];
  } else {
    return Util.sortBy(knownSizes, function sortAscending(a, b) {
      return b - a;
    });
  }
}

/**
 * Detect the current breakpoint and update the element if necessary.
 */
function update(image) {
  if (image.lazyLoad) {
    return;
  }

  var rect = DOM.getRect(image.element);
  var foundBreakpoint;

  for (var i = 0; i < image.knownSizes.length; i++) {
    var s = image.knownSizes[i];

    if (rect.width <= s) {
      foundBreakpoint = s;
    } else {
      break;
    }
  }

  if (!foundBreakpoint) {
    foundBreakpoint = image.knownSizes[0];
  }

  if (foundBreakpoint !== image.currentBreakpoint || !image.hasRunOnce) {
    image.currentBreakpoint = foundBreakpoint;
    loadImageForBreakpoint(image, image.currentBreakpoint);
  }
}

function checkVisibility(image) {
  if (!image.lazyLoad) {
    return;
  }

  image.observer.recalculateOffsets();
}

/**
 * Load the requested image.
 * @param {ResponsiveImage} image The ResponsiveImage instance.
 * @param {String} s Filename.
 */
function loadImageForBreakpoint(image, s) {
  var alreadyLoaded = image.loadedSizes[s];

  if ('undefined' !== typeof alreadyLoaded) {
    setImage(image, alreadyLoaded);
  } else {
    var img = new Image();

    img.onload = function() {
      image.loadedSizes[s] = img;
      setImage(image, img);
      update(image);

      image.hasRunOnce = true;
    };

    // If requesting retina fails
    img.onerror = function() {
      if (image.hasRetina) {
        img.src = image.getPath(image, s, false);
      } else {
        image.trigger('error', img);
      }
    };

    img.src = image.getPath(image, s, image.hasRetina);
  }
}

/**
 * Set the image on the element.
 * @param {Element} img Image element.
 */
function setImage(image, img) {
  if (!image.hasLoaded) {
    image.hasLoaded = true;

    setTimeout(function() {
      image.element.className += ' loaded';
    }, 100);
  }

  image.trigger('load', img);

  if (image.element.tagName.toLowerCase() === 'img') {
    return setImageTag(image, img);
  } else {
    return setDivTag(image, img);
  }
}

/**
 * Set the image on the img element.
 * @param {Element} img Image element.
 */
function setImageTag(image, img) {
  image.element.src = img.src;
}

/**
 * Set the image on the div element.
 * @param {Element} img Image element.
 */
function setDivTag(image, img) {
  var setElemStyle = DOM.setStyle(image.element);
  setElemStyle('backgroundImage', 'url(' + img.src + ')');

  if (image.preserveAspectRatio) {
    var w, h;

    if (image.knownDimensions) {
      w = image.knownDimensions[0];
      h = image.knownDimensions[1];
    } else {
      w = img.width;
      h = img.height;
    }

    setElemStyle('backgroundSize', 'cover');

    if (image.isFlexible) {
      setElemStyle('paddingBottom', ((h / w) * 100.0) + '%');
    } else {
      setElemStyle('width', w + 'px');
      setElemStyle('height', h + 'px');
    }
  }
}

/**
 * Get the path for the image given the current breakpoints and
 * browser features.
 * @param {ResponsiveImage} image The image data.
 * @param {String} s Requested path.
 * @param {boolean} wantsRetina If we should look for retina.
 * @return {String} The resulting path.
 */
function getPath(image, s, wantsRetina) {
  if (s === 0) { return image.src; }

  var parts = image.src.split('.');
  var ext = parts.pop();

  return parts.join('.') + '-' + s + (wantsRetina ? '@2x' : '') + '.' + ext;
}

module.exports = {
  create: create,
  createFromElement: createFromElement,
  update: update,
  checkVisibility: checkVisibility
};
