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
  var out = {};

  map(function(key) {
    out[key] = f(obj[key], key);
  }, objectKeys(obj));

  return out;
}

/**
 * Map a function over an object.
 * @param {Object} obj The object.
 * @param {Function} f The function.
 * @return {Object} The resulting object.
 */
function map(f, arr) {
  var out = [];

  for (var i = 0; i < arr.length; i++) {
    out.push(f(arr[i]));
  }

  return out;
}

/**
 * Call a function over an object.
 * @param {Object} obj The object.
 * @param {String} fName The function.
 * @return {Object} The resulting object.
 */
function invokeObject() {
  var args = Array.prototype.slice.call(arguments, 1);
  var obj = args.shift();
  var fName = args.shift();

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

function isEmpty(arr) {
  return !arr.length;
}

function objectVals(obj) {
  return map(partial(get, obj), objectKeys(obj));
}

function reduce(f, arr, val) {
  return (function recur(f, input, output) {
    return isEmpty(input)
      ? output
      : recur(f, shift(input), f(output, first(input)));
  })(f, arr, val);
}

function select(f, arr) {
  return reduce(function(sum, v) {
    return isTrue(v)
      ? push(sum, v)
      : sum;
  }, arr, []);
}

function reject(f, arr) {
  return reduce(function(sum, v) {
    return !isTrue(v)
      ? push(sum, v)
      : sum;
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
var partial = variadic(function partial(f, args) {
  return variadic(function(args2) {
    return f.apply(this, args.concat(args2));
  });
});

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

function variadic(fn) {
  var argLength = fn.length;

  if (argLength < 1) {
    return fn;
  } else if (argLength === 1)  {
    return function() {
      return fn.call(this, Array.prototype.slice.call(arguments, 0));
    };
  } else {
    return function () {
      var numberOfArgs = arguments.length,
          namedArgs = Array.prototype.slice.call(arguments, 0, argLength - 1),
          numberOfMissingNamedArgs = Math.max(argLength - numberOfArgs - 1, 0),
          argPadding = new Array(numberOfMissingNamedArgs),
          variadicArgs = Array.prototype.slice.call(arguments, fn.length - 1);

      return fn.apply(this, namedArgs.concat(argPadding).concat([variadicArgs]));
    };
  }
}

function delay(f, ms) {
  return variadic(function(args) {
    setTimeout(apply(partial, f, args), ms);
  });
}

function apply(f, args) {
  return f.apply(null, args);
}

var call = variadic(function(f, args) {
  return apply(f, args);
});

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

var first = partial(nth, 0);
var isTrue = partial(equals, true);

function toArray(v) {
  return [v];
}

function unshift(arr, v) {
  var arr2 = arr.slice(0);
  Array.prototype.unshift.call(arr2, v);
  return arr2;
}

function shift(arr, v) {
  var arr2 = arr.slice(0);
  Array.prototype.shift.call(arr2, v);
  return arr2;
}

function push(arr, v) {
  var arr2 = arr.slice(0);
  Array.prototype.push.call(arr2, v);
  return arr2;
}

var compose = variadic(function(fns) {
  return function(value) {
    for (var i = fns.length - 1; i >= 0; --i) {
      value = fns[i](value);
    }
    return value;
  };
});

var once = variadic(function(f, args) {
  var hasRun = false;
  return function() {
    if (!hasRun) {
      hasRun = true;
      return apply(f, args);
    }
  };
});

export {
  indexOf, throttle, debounce, getViewportHeight, getViewportWidth, testMQ,
  getRect, mapObject, objectKeys, functionBind, partial, arrayIndexOf,
  variadic, map, apply, objectVals, call, push, unshift, equals,
  delay, unshift, nth, first, compose, select, isTrue, get, shift, eventListener,
  when, reduce, once
};
