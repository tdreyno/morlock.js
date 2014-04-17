import { memoize, isDefined, mapObject, partial, flip, indexOf } from "morlock/core/util";

/**
 * Backwards compatible Media Query matcher.
 * @param {String} mq Media query to match.
 * @return {Boolean} Whether it matched.
 */
export var testMQ = Modernizr.mq;

/**
 * Return a function which gets the viewport width or height.
 * @private
 * @param {String} dimension The dimension to look up.
 * @param {String} inner The inner dimension.
 * @param {String} client The client dimension.
 * @return {function} The getter function.
 */
function makeViewportGetter_(dimension, inner, client) {
  if (testMQ('(min-' + dimension + ':' + window[inner] + 'px)')) {
    return function getWindowDimension_() {
      return window[inner];
    };
  } else {
    var docElem = document.documentElement;
    return function getDocumentDimension_() {
      return docElem[client];
    };
  }
}

export var getViewportWidth = makeViewportGetter_('width', 'innerWidth', 'clientWidth');
export var getViewportHeight = makeViewportGetter_('height', 'innerHeight', 'clientHeight');

var detectedIE10_ = (navigator.userAgent.indexOf('MSIE 10') !== -1);

/**
 * Get the document scroll.
 * @return {number}
 */
export function documentScrollY() {
  if (detectedIE10_ && (window.pageYOffset != document.documentElement.scrollTop)) {
    return document.documentElement.scrollTop;
  }

  return window.pageYOffset || document.documentElement.scrollTop;
}

/**
 * Calculate the rectangle of the element with an optional buffer.
 * @param {Element} elem The element.
 * @param {number} buffer An extra padding.
 * @param {number} currentScrollY The known scrollY value.
 */
export function getRect(elem, buffer, currentScrollY) {
  buffer = typeof buffer == 'number' && buffer || 0;

  if (elem && !elem.nodeType) {
    elem = elem[0];
  }

  if (!elem || 1 !== elem.nodeType) {
    return false;
  }
  
  var bounds = elem.getBoundingClientRect();

  if (!isDefined(currentScrollY)) {
    currentScrollY = documentScrollY();
  }

  var topWithCeiling = (currentScrollY < 0) ? bounds.top + currentScrollY : bounds.top;
  
  var rect = {
    right: bounds.right + buffer,
    left: bounds.left - buffer,
    bottom: bounds.bottom + buffer,
    top: topWithCeiling - buffer
  };

  rect.width = rect.right - rect.left;
  rect.height = rect.bottom - rect.top;

  return rect;
}

export var cssPrefix = memoize(Modernizr.prefixed);

export function setStyle(elem, key, value) {
  elem.style[cssPrefix(key)] = value;
}

export function setStyles(elem, styles) {
  mapObject(flip(partial(setStyle, elem)), styles);
}

export function getStyle(elem, key) {
  return elem.style[cssPrefix(key)];
}

export function insertBefore(before, elem) {
  elem.parentNode.insertBefore(before, elem);
}

var hasClass, addClass, removeClass;

function getClassesPoly_(elem) {
  return elem.className.split(' ');
}

if (!isDefined(window.Element) || ('classList' in document.documentElement)) {
  hasClass = function hasClassNative_(elem, className) {
    return elem.classList.contains(className);
  };

  addClass = function addClassNative_(elem, className) {
    elem.classList.add(className);
  };

  removeClass = function removeClassNative_(elem, className) {
    elem.classList.remove(className);
  };
} else {
  hasClass = function hasClassPoly_(elem, className) {
    return indexOf(getClassesPoly_(elem), className) !== -1;
  };

  addClass = function addClassPoly_(elem, className) {
    if (hasClass(elem)) { return; }

    var currentClasses = getClassesPoly_(elem);
    currentClasses.push(className);

    elem.className = currentClasses.join(' ');
  };

  removeClass = function removeClassPoly_(elem, className) {
    if (!hasClass(elem)) { return; }

    var currentClasses = getClassesPoly_(elem);

    var idx = indexOf(currentClasses, className);
    currentClasses.splice(idx, 1);

    elem.className = currentClasses.join(' ');
  };
}

export { hasClass, addClass, removeClass };
