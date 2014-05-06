import { memoize, isDefined, mapObject, flip, indexOf, forEach, autoCurry } from "morlock/core/util";
import CustomModernizr from "vendor/modernizr";

/**
 * Backwards compatible Media Query matcher.
 * @param {String} mq Media query to match.
 * @return {Boolean} Whether it matched.
 */
export var testMQ = CustomModernizr.mq;

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
 */
export function getRect(elem) {
  if (elem && !elem.nodeType) {
    elem = elem[0];
  }

  if (!elem || 1 !== elem.nodeType) {
    return false;
  }
  
  var bounds = elem.getBoundingClientRect();

  return {
    height: bounds.bottom - bounds.top,
    top: bounds.top
  };
}

export var cssPrefix = memoize(CustomModernizr.prefixed);

export var setStyle = autoCurry(function setStyle_(elem, key, value) {
  elem.style[cssPrefix(key)] = value;
});

export function setStyles(elem, styles) {
  mapObject(flip(setStyle(elem)), styles);
}

function getComputedStyle(elem, key) {
  var doc = (elem.nodeType == 9) ? elem : (elem.ownerDocument || elem.document);

  if (doc.defaultView && doc.defaultView.getComputedStyle) {
    var styles = doc.defaultView.getComputedStyle(elem, null);
    if (styles) {
      return styles[key] || styles.getPropertyValue(key) || '';
    }
  }

  return '';
}

function getCascadedStyle(elem, key) {
  return elem.currentStyle ? elem.currentStyle[key] : null;
}

export var getStyle = autoCurry(function getStyle_(elem, key) {
  var prefixedKey = cssPrefix(key);

  return getComputedStyle(elem, prefixedKey) ||
         getCascadedStyle(elem, prefixedKey) ||
         (elem.style && elem.style[prefixedKey]);
});

export function insertBefore(before, elem) {
  elem.parentNode.insertBefore(before, elem);
}

export function detachElement(elem) {
  if (elem.parentNode) {
    elem.parentNode.removeChild(elem); 
  }
}

function inDocument_(elem) {
  while (elem = elem.parentNode) {
    if (elem == document) {
      return true;
    }
  }

  return false;
}

export function isVisible(elem) {
  if (!inDocument_(elem)) {
    return false;
  }

  var isDisplayNone = (getStyle(elem, 'display') === 'none');

  if (isDisplayNone) {
    return false;
  }

  var parent = elem.parentNode;

  if (parent) {
    return isVisible(parent);
  }

  return true;
}

var hasClass_, addClass_, removeClass_;

export function getClasses(elem) {
  return elem.className.length > 0 ? elem.className.split(' ') : [];
}

if (!isDefined(window.Element) || ('classList' in document.documentElement)) {
  hasClass_ = function hasClassNative_(elem, className) {
    return elem.classList.contains(className);
  };

  addClass_ = function addClassNative_(elem, className) {
    elem.classList.add(className);
  };

  removeClass_ = function removeClassNative_(elem, className) {
    elem.classList.remove(className);
  };
} else {
  hasClass_ = function hasClassPoly_(elem, className) {
    return indexOf(getClasses(elem), className) !== -1;
  };

  addClass_ = function addClassPoly_(elem, className) {
    if (hasClass(elem)) { return; }

    var currentClasses = getClasses(elem);
    currentClasses.push(className);

    elem.className = currentClasses.join(' ');
  };

  removeClass_ = function removeClassPoly_(elem, className) {
    if (!hasClass(elem)) { return; }

    var currentClasses = getClasses(elem);

    var idx = indexOf(currentClasses, className);
    currentClasses.splice(idx, 1);

    elem.className = currentClasses.join(' ');
  };
}

export var hasClass = autoCurry(hasClass_);
export var addClass = autoCurry(addClass_);
export var removeClass = autoCurry(removeClass_);

export var addClasses = autoCurry(function addClasses_(elem, classes) {
  forEach(addClass(elem), classes);
});
