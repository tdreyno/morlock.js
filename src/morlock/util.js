/**
 * Backwards compatible Array.prototype.indexOf
 * @param {Array} list List of items.
 * @param {Object} item Item to search for.
 * @return {Number} Index of match or -1 if not found.
 */
function indexOf(list, item) {
  for (var i = 0; i < list.length; i++) {
    if (list[i] === item) {
      return i;
    }
  }

  return -1;
}

/**
 * Throttle a function.
 * @param {Function} f The function.
 * @param {Number} delay The delay in ms.
 */
function throttle(f, delay) {
  var timeoutId;
  var previous = 0;

  return function() {
    var now = +(new Date());
    var remaining = delay - (now - previous);

    if (remaining <= 0) {
      clearTimeout(timeoutId);
      timeoutId = null;
      previous = now;

      f();
    } else if (!timeoutId) {
      timeoutId = setTimeout(function() {
        previous = +(new Date());
        timeoutId = null;

        f();
      }, remaining);
    }
  };
}

/**
 * Debounce a function.
 * @param {Function} f The function.
 * @param {Number} delay The delay in ms.
 */
function debounce(f, delay) {
  var timeoutId = null;

  return function() {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(function() {
      timeoutId = null;
      f();
    }, delay);
  };
}

/**
 * Return a function which gets the viewport width or height.
 * @param {String} dimension The dimension to look up.
 * @param {String} inner The inner dimension.
 * @param {String} client The client dimension.
 * @return {Function} The getter function.
 */
function makeViewportGetter_(dimension, inner, client) {
  if ((docElem[client] < win[inner]) &&
      testMQ('(min-' + dimension + ':' + win[inner] + 'px)')) {
    return function() {
      return win[inner];
    };
  } else {
    return function() {
      return docElem[client];
    };
  }
}

var getViewportWidth = makeViewportGetter_('width', 'innerWidth', 'clientWidth');
var getViewportHeight = makeViewportGetter_('height', 'innerHeight', 'clientHeight');

var win = window;
var docElem = document.documentElement;

/**
 * Backwards compatible Media Query matcher.
 * @param {String} mq Media query to match.
 * @return {Boolean} Whether it matched.
 */
function testMQ(mq) {
  var matchMedia = window.matchMedia || window.msMatchMedia;
  if (matchMedia) {
    return !!matchMedia(mq).matches;
  }

  var div = document.createElement('div');
  div.id = 'testmq';
  div.innerHTML = '<style id="stestmq">@media ' + mq + ' { #testmq { position: absolute; } }</style>';
  document.body.appendChild(div);

  return (window.getComputedStyle ?
          getComputedStyle(div, null) :
          div.currentStyle)['position'] == 'absolute';
}

export { indexOf, throttle, debounce, getViewportHeight, getViewportWidth, testMQ };
