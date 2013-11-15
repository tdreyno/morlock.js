function slice(arr, pos) {
  return Array.prototype.slice.call(arr, pos);
}

function copyArray(arr) {
  return slice(arr, 0);
}

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
    var args = arguments;
    var now = +(new Date());
    var remaining = delay - (now - previous);

    if (remaining <= 0) {
      clearTimeout(timeoutId);
      timeoutId = null;
      previous = now;

      apply(f, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(function() {
        previous = +(new Date());
        timeoutId = null;

        apply(f, args);
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
  var docElem = document.documentElement;

  if (testMQ('(min-' + dimension + ':' + window[inner] + 'px)')) {
    return function() {
      return window[inner];
    };
  } else {
    return function() {
      return docElem[client];
    };
  }
}

var getViewportWidth = makeViewportGetter_('width', 'innerWidth', 'clientWidth');
var getViewportHeight = makeViewportGetter_('height', 'innerHeight', 'clientHeight');

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

/**
 * Calculate the rectangle of the element with an optional buffer.
 * @param {Element} elem The element.
 * @param {Number} buffer An extra padding.
 */
function getRect(elem, buffer) {
  buffer = typeof buffer == 'number' && buffer || 0;

  if (elem && !elem.nodeType) {
    elem = elem[0];
  }

  if (!elem || 1 !== elem.nodeType) {
    return false;
  }
  
  var bounds = elem.getBoundingClientRect();
  
  var rect = {
    right: bounds.right + buffer,
    left: bounds.left - buffer,
    bottom: bounds.bottom + buffer,
    top: bounds.top - buffer
  };

  rect.width = rect.right - rect.left;
  rect.height = rect.bottom - rect.top;

  return rect;
}

/**
 * Map a function over an object.
 * @param {Object} obj The object.
 * @param {Function} f The function.
 * @return {Object} The resulting object.
 */
function mapObject(f, obj) {
  return reduce(function(sum, v) {
    sum[v] = f(obj[v], v);
    return sum;
  }, objectKeys(obj), {});
}

/**
 * Map a function over an object.
 * @param {Object} obj The object.
 * @param {Function} f The function.
 * @return {Object} The resulting object.
 */
function map(f, arr) {
  return reduce(function(sum, v) {
    return push(sum, f(v));
  }, arr, []);
}

/**
 * Call a function over an object.
 * @param {Object} obj The object.
 * @param {String} fName The function.
 * @return {Object} The resulting object.
 */
function invokeObject(obj, fName /* args */) {
  var args = slice(arguments, 2);

  return mapObject(function(val) {
    return val[fName].apply(val, args);
  }, obj);
}

/**
 * Get the keys of an object.
 * @param {Object} obj The object.
 * @return {Array} An array of keys.
 */
function objectKeys(obj) {
  if (Object.keys) {
    return Object.keys(obj);
  }

  var out = [];

  mapObject(obj, function(_, key) {
    out.push(key);
  });

  return out;
}

function get(obj, key) {
  return obj[key];
}

function set(obj, key, v) {
  obj[key] = v;
}

function flip(f) {
  return function() {
    apply(f, Array.prototype.reverse.call(arguments));
  };
}

function isEmpty(arr) {
  return arr.length <= 0;
}

function objectVals(obj) {
  return map(partial(get, obj), objectKeys(obj));
}

function Thunk(fn) {
  this.fn = fn;
}

Thunk.prototype.exec = function () {
  return this.fn();
};
    
function trampoline(fn) {
  var trampolined = function() {
    var result = fn.apply(this, arguments);
    
    while (result instanceof Thunk) {
      result = result.exec();
    }
    
    return result;
  };

  trampolined.original_fn = fn;

  return trampolined;
}

function tailCall(fn /*, args*/) {
  var self = this;
  var args = rest(arguments);

  if (fn.original_fn instanceof Function) {
    return new Thunk(function() {
      return fn.original_fn.apply(self, args);
    });
  } else {
    return new Thunk(function() {
      return fn.apply(self, args);
    });
  }
}

function reduce(f, arr, val) {
  var _reduce = trampoline(function myself(sum, list) {
    return !isEmpty(list) ?
      tailCall(myself, f(sum, first(list)), rest(list)) :
      sum;
  });

  return _reduce(val, arr);
}

function select(f, arr) {
  return reduce(function(sum, v) {
    return isTrue(f(v)) ? push(sum, v) : sum;
  }, arr, []);
}

function reject(f, arr) {
  return reduce(function(sum, v) {
    return !isTrue(f(v)) ? push(sum, v) : sum;
  }, arr, []);
}

function not(v) {
  return !v;
}

function equals(a, b) {
  return a === b;
}

function when(truth, f) {
  return function() {
    var whatIsTruth = truth; // Do not mutate original var :(
    if ('function' === typeof truth) {
      whatIsTruth = apply(truth, arguments);
    }

    if (whatIsTruth) {
      return apply(f, arguments);
    }
  };
}

/**
 * Bind a function's "this" value.
 * @param {Function} f The function.
 * @param {Object} obj The object.
 * @return {Function} The bound function.
 */
function functionBind(f, obj) {
  if (Function.prototype.bind) {
    return f.bind(obj);
  }

  return function() {
    return f.apply(obj, arguments);
  };
}

/**
 * Partially apply a function.
 */
function partial(f /*, args*/) {
  var args = rest(arguments);

  return function() {
    var args2 = slice(arguments, 0);
    return f.apply(this, args.concat(args2));
  };
}

/**
 * Find out if an array contains a value.
 * @param {Array} arr The array.
 * @param {Object} val The value.
 * @return {Number} The index of match or -1.
 */
function arrayIndexOf(arr, val) {
  if (Array.prototype.indexOf) {
    return arr.indexOf(val);
  }

  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      return i;
    }
  }

  return -1;
}

function delay(f, ms) {
  return function() {
    setTimeout(apply(partial, f, arguments), ms);
  };
}

function apply(f, args) {
  return f.apply(null, args);
}

function rest(arr, fromStart) {
  fromStart = ('undefined' !== typeof fromStart) ? fromStart : 1;
  return slice(arr, fromStart);
}

function call(f /*, args */) {
  return apply(f, rest(arguments));
}

function eventListener(target, eventName, cb) {
  if (target.addEventListener) {
    target.addEventListener(eventName, cb, false);
    return function() {
      target.removeEventListener(eventName, cb, false);
    };
  } else if (target.attachEvent) {
    target.attachEvent('on' + eventName, cb);
    return function() {
      target.detachEvent('on' + eventName, cb);
    };
  }
}

function nth(idx, arr) {
  return arr[idx];
}

function first(arr) {
  return arr[0];
}

function last(arr) {
  return arr[arr.length - 1];
}

var isTrue = partial(equals, true);

function toArray(v) {
  return [v];
}

function unshift(arr, v) {
  var arr2 = copyArray(arr);
  Array.prototype.unshift.call(arr2, v);
  return arr2;
}

function shift(arr, v) {
  var arr2 = copyArray(arr);
  Array.prototype.shift.call(arr2, v);
  return arr2;
}

function push(arr, v) {
  var arr2 = copyArray(arr);
  Array.prototype.push.call(arr2, v);
  return arr2;
}

function sortBy(arr, f) {
  var arr2 = copyArray(arr);
  Array.prototype.sort.call(arr2, f);
  return arr2;
}

function compose(/*fns*/) {
  var fns = arguments;

  return function(value) {
    for (var i = fns.length - 1; i >= 0; --i) {
      value = fns[i](value);
    }
    return value;
  };
}

function once(f /*, args*/) {
  var args = rest(arguments);
  var hasRun = false;
  return function() {
    if (!hasRun) {
      hasRun = true;
      return apply(f, args);
    }
  };
}

function parseInteger(str) {
  return parseInt(str, 10);
}

export {
  indexOf, throttle, debounce, getViewportHeight, getViewportWidth, testMQ,
  getRect, mapObject, objectKeys, functionBind, partial, arrayIndexOf,
  map, apply, objectVals, call, push, unshift, equals,
  delay, unshift, nth, first, last, compose, select, isTrue, get, shift, eventListener,
  when, reduce, once, sortBy, parseInteger, set, flip, trampoline, tailCall,
  copyArray
};
