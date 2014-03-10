(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    //Allow using this built library as an AMD module
    //in another project. That other project will only
    //see this AMD call, not the internal modules in
    //the closure below.
    define(factory);
  } else {
    //Browser globals case. Just assign the
    //result to a property on the global.
    var parts = factory();
    root.ResizeController = parts.ResizeController;
    root.ResponsiveImage = parts.ResponsiveImage;
    root.ScrollController = parts.ScrollController;
    root.morlock = parts.morlock;
  }
}(this, function () {
  //almond, and your modules will be inlined here
/**
 * almond 0.2.6 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../vendor/almond", function(){});

define("morlock/core/util", 
  ["exports"],
  function(__exports__) {
    
    /**
     * Slice an array.
     * @param {Array} arr The original array.
     * @param {Number} pos The position to slice from.
     * @return {Array} New sliced array.
     */
    function slice(arr, pos) {
      return Array.prototype.slice.call(arr, pos);
    }

    /**
     * Shallow copy an array.
     * @param {Array} arr The original array.
     * @return {Array} New copied array.
     */
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
      if (Array.prototype.indexOf) {
        return list.indexOf(item);
      }

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
        var lastArgs = arguments;

        timeoutId = setTimeout(function() {
          timeoutId = null;
          f.apply(null, lastArgs);
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

    var detectedIE10 = (navigator.userAgent.indexOf('MSIE 10') !== -1);

    /**
     * Get the document scroll.
     * @return {number}
     */
    function documentScrollY() {
      if (detectedIE10 && (window.pageYOffset != document.body.scrollTop)) {
        return document.body.scrollTop;
      }

      return window.pageYOffset || document.body.scrollTop;
    }

    /**
     * Calculate the rectangle of the element with an optional buffer.
     * @param {Element} elem The element.
     * @param {Number} buffer An extra padding.
     * @param {Number} currentScrollY The known scrollY value.
     */
    function getRect(elem, buffer, currentScrollY) {
      buffer = typeof buffer == 'number' && buffer || 0;

      if (elem && !elem.nodeType) {
        elem = elem[0];
      }

      if (!elem || 1 !== elem.nodeType) {
        return false;
      }
      
      var bounds = elem.getBoundingClientRect();

      if ('undefined' === typeof currentScrollY) {
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
     * Get the keys of an object.
     * @param {Object} obj The object.
     * @return {Array} An array of keys.
     */
    function objectKeys(obj) {
      if (!obj) { return []; }

      if (Object.keys) {
        return Object.keys(obj);
      }

      var out = [];

      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          out.push(key);
        }
      }

      return out;
    }

    /**
     * Get a value on an object.
     * @param {Object} obj The object.
     * @param {String} key The key.
     * @return {Object} Some result.
     */
    function get(obj, key) {
      return obj[key];
    }

    /**
     * Set a value on an object.
     * @param {Object} obj The object.
     * @param {String} key The key.
     * @param {String} v The value.
     */
    function set(obj, key, v) {
      obj[key] = v;
    }

    // function invoke(fName/*, args */) {
    //   var args = rest(arguments);
    //   return function(obj) {
    //     return obj[fName].apply(obj, args);
    //   };
    // }

    function flip(f) {
      return function() {
        return apply(f, Array.prototype.reverse.call(arguments));
      };
    }

    function isEmpty(arr) {
      return !(arr && arr.length);
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

    function delay(f, ms) {
      return function() {
        setTimeout(partial(f, arguments), ms);
      };
    }

    function defer(f, ms) {
      return delay(f, 'undefined' !== typeof ms ? 1 : ms);
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

    function pop(arr, v) {
      var arr2 = copyArray(arr);
      Array.prototype.pop.call(arr2, v);
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

    function constantly(val) {
      return val;
    }

    var rAF = (function() {
      var correctRAF = window.requestAnimationFrame;
      var lastTime = 0;
      var vendors = ['webkit', 'moz'];

      for (var x = 0; x < vendors.length && !correctRAF; ++x) {
        correctRAF = window[vendors[x]+'RequestAnimationFrame'];
      }

      if (!correctRAF) {
        correctRAF = function(callback, element) {
          var currTime = new Date().getTime();
          var timeToCall = Math.max(0, 16 - (currTime - lastTime));
          var id = window.setTimeout(function() { callback(currTime + timeToCall); },
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
        };
      }

      return correctRAF;
    }());

    __exports__.indexOf = indexOf;
    __exports__.throttle = throttle;
    __exports__.debounce = debounce;
    __exports__.getViewportHeight = getViewportHeight;
    __exports__.getViewportWidth = getViewportWidth;
    __exports__.testMQ = testMQ;
    __exports__.getRect = getRect;
    __exports__.mapObject = mapObject;
    __exports__.objectKeys = objectKeys;
    __exports__.functionBind = functionBind;
    __exports__.partial = partial;
    __exports__.map = map;
    __exports__.apply = apply;
    __exports__.objectVals = objectVals;
    __exports__.call = call;
    __exports__.push = push;
    __exports__.pop = pop;
    __exports__.unshift = unshift;
    __exports__.equals = equals;
    __exports__.not = not;
    __exports__.delay = delay;
    __exports__.unshift = unshift;
    __exports__.nth = nth;
    __exports__.first = first;
    __exports__.last = last;
    __exports__.compose = compose;
    __exports__.select = select;
    __exports__.isTrue = isTrue;
    __exports__.get = get;
    __exports__.shift = shift;
    __exports__.eventListener = eventListener;
    __exports__.when = when;
    __exports__.reduce = reduce;
    __exports__.once = once;
    __exports__.sortBy = sortBy;
    __exports__.parseInteger = parseInteger;
    __exports__.set = set;
    __exports__.flip = flip;
    __exports__.trampoline = trampoline;
    __exports__.tailCall = tailCall;
    __exports__.copyArray = copyArray;
    __exports__.defer = defer;
    __exports__.slice = slice;
    __exports__.isEmpty = isEmpty;
    __exports__.reject = reject;
    __exports__.rest = rest;
    __exports__.constantly = constantly;
    __exports__.rAF = rAF;
    __exports__.documentScrollY = documentScrollY;
  });
define("morlock/core/stream", 
  ["morlock/core/util","exports"],
  function(__dependency1__, __exports__) {
    
    var debounceCall = __dependency1__.debounce;
    var throttleCall = __dependency1__.throttle;
    var delayCall = __dependency1__.delay;
    var mapArray = __dependency1__.map;
    var apply = __dependency1__.apply;
    var first = __dependency1__.first;
    var rest = __dependency1__.rest;
    var push = __dependency1__.push;
    var apply = __dependency1__.apply;
    var unshift = __dependency1__.unshift;
    var eventListener = __dependency1__.eventListener;
    var compose = __dependency1__.compose;
    var when = __dependency1__.when;
    var equals = __dependency1__.equals;
    var partial = __dependency1__.partial;
    var once = __dependency1__.once;
    var copyArray = __dependency1__.copyArray;
    var flip = __dependency1__.flip;
    var call = __dependency1__.call;
    var indexOf = __dependency1__.indexOf;
    var rAF = __dependency1__.rAF;

    // Internal tracking of how many streams have been created.
    var nextID = 0;

    /**
     * Ghetto Record implementation.
     */
    function Stream(trackSubscribers) {
      if (!(this instanceof Stream)) {
        return new Stream(trackSubscribers);
      }

      this.trackSubscribers = !!trackSubscribers;
      this.subscribers = null;
      this.subscriberSubscribers = null;
      this.streamID = nextID++;
      this.value = null; // TODO: Some kind of buffer
    }

    function create(trackSubscribers) {
      return new Stream(trackSubscribers);
    }

    function emit(stream, val) {
      mapArray(partial(flip(call), val), stream.subscribers);

      stream.value = val;
    }

    function getValue(stream) {
      return stream.value;
    }

    function onValue(stream, f) {
      stream.subscribers = stream.subscribers || [];
      stream.subscribers.push(f);

      if (stream.trackSubscribers) {
        mapArray(partial(flip(call), f), stream.subscriberSubscribers);
      }
    }

    function offValue(stream, f) {
      if (stream.subscribers) {
        var idx = indexOf(stream.subscribers, f);
        if (idx !== -1) {
          stream.subscribers.splice(idx, 1);
        }
      }
    }

    function onSubscription(stream, f) {
      if (stream.trackSubscribers) {
        stream.subscriberSubscribers = stream.subscriberSubscribers || [];
        stream.subscriberSubscribers.push(f);
      }
    }

    function createFromEvents(target, eventName) {
      var outputStream = create(true);
      var boundEmit = partial(emit, outputStream);

      /**
       * Lazily subscribes to a dom event.
       */
      var attachListener = partial(eventListener, target, eventName, boundEmit);
      onSubscription(outputStream, once(attachListener));

      return outputStream;
    }

    function interval(ms) {
      var outputStream = create(true);
      var boundEmit = partial(emit, outputStream);

      /**
       * Lazily subscribes to a timeout event.
       */
      var attachListener = partial(setInterval, boundEmit, ms);
      onSubscription(outputStream, once(attachListener));

      return outputStream;
    }

    function timeout(ms) {
      var outputStream = create(true);
      var boundEmit = partial(emit, outputStream);

      /**
       * Lazily subscribes to a timeout event.
       */
      var attachListener = partial(setTimeout, boundEmit, ms);
      onSubscription(outputStream, once(attachListener));

      return outputStream;
    }

    function createFromRAF() {
      var outputStream = create(true);
      var boundEmit = partial(emit, outputStream);

      /**
       * Lazily subscribes to a raf event.
       */
      function sendEvent(t) {
        boundEmit(t);
        rAF(sendEvent);
      }

      onSubscription(outputStream, once(sendEvent));

      return outputStream;
    }

    function merge(/* streams */) {
      var streams = copyArray(arguments);
      var outputStream = create();
      var boundEmit = partial(emit, outputStream);
      
      mapArray(function(stream) {
        return onValue(stream, boundEmit);
      }, streams);

      return outputStream;
    }

    function _duplicateStreamOnEmit(stream, f, args) {
      var outputStream = create();
      var boundEmit = partial(emit, outputStream);
      var boundArgs = mapArray(function(v) {
        return v === ':e:' ? boundEmit : v;
      }, args);
      onValue(stream, apply(apply, [f, boundArgs]));
      return outputStream;
    }

    function delay(ms, stream) {
      if (ms <= 0) { return stream; }
      return _duplicateStreamOnEmit(stream, delayCall, [':e:', ms]);
    }

    function throttle(ms, stream) {
      if (ms <= 0) { return stream; }
      return _duplicateStreamOnEmit(stream, throttleCall, [':e:', ms]);
    }

    function debounce(ms, stream) {
      if (ms <= 0) { return stream; }
      return _duplicateStreamOnEmit(stream, debounceCall, [':e:', ms]);
    }

    function map(f, stream) {
      return _duplicateStreamOnEmit(stream, compose, [':e:', f]);
    }

    function filter(f, stream) {
      return _duplicateStreamOnEmit(stream, when, [f, ':e:']);
    }

    function filterFirst(val, stream) {
      return filter(compose(partial(equals, val), first), stream);
    }

    function sample(sourceStream, sampleStream) {
      return _duplicateStreamOnEmit(sampleStream,
        compose, [':e:', partial(getValue, sourceStream)]);
    }

    __exports__.create = create;
    __exports__.emit = emit;
    __exports__.getValue = getValue;
    __exports__.onValue = onValue;
    __exports__.offValue = offValue;
    __exports__.onSubscription = onSubscription;
    __exports__.createFromEvents = createFromEvents;
    __exports__.timeout = timeout;
    __exports__.createFromRAF = createFromRAF;
    __exports__.merge = merge;
    __exports__.delay = delay;
    __exports__.throttle = throttle;
    __exports__.debounce = debounce;
    __exports__.map = map;
    __exports__.filter = filter;
    __exports__.filterFirst = filterFirst;
    __exports__.sample = sample;
    __exports__.interval = interval;
  });
define("morlock/streams/breakpoint-stream", 
  ["morlock/core/util","morlock/core/stream","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    var objectVals = __dependency1__.objectVals;
    var partial = __dependency1__.partial;
    var mapObject = __dependency1__.mapObject;
    var apply = __dependency1__.apply;
    var push = __dependency1__.push;
    var testMQ = __dependency1__.testMQ;
    var Stream = __dependency2__;

    /**
     * Create a new Stream containing events which fire when the browser
     * enters and exits breakpoints (media queries).
     * @param {Object} breakpoints Map containing the name of each breakpoint
     *   as the key. The value can be either a media query string or a map
     *   with min and/or max keys.
     * @param {Stream} resizeStream A stream emitting resize events.
     * @return {Stream} The resulting stream.
     */
    function create(breakpoints, resizeStream) {
      var breakpointStreams = mapObject(function(val, key) {
        var s = Stream.create();

        var mq = 'string' === typeof val ? val : breakpointToString(val);

        Stream.onValue(resizeStream, function() {
          var wasActive = Stream.getValue(s);
          wasActive = wasActive !== null ? wasActive : false;

          if (wasActive !== testMQ(mq)) {
            Stream.emit(s, !wasActive);
          }
        });

        return Stream.map(partial(push, [key]), s);
      }, breakpoints);

      return apply(Stream.merge, objectVals(breakpointStreams));
    }

    /**
     * Convert a map with max/min values into a media query string.
     * @param {Object} options The options.
     * @param {number=} options.min The minimum size.
     * @param {number=} options.max The maximum size.
     * @return {string} The resulting media query.
     */
    function breakpointToString(options) {
      var mq;

      if ('undefined' !== typeof options.mq) {
        mq = options.mq;
      } else {
        options.max = ('undefined' !== typeof options.max) ? options.max : Infinity;
        options.min = ('undefined' !== typeof options.min) ? options.min : 0;

        mq = 'only screen';
        if (options.max < Infinity) {
          mq += ' and (max-width: ' + options.max + 'px)';
        }
        if (options.min > 0) {
          mq += ' and (min-width: ' + options.min + 'px)';
        }
      }

      return mq;
    }

    __exports__.create = create;
  });
define("morlock/streams/resize-stream", 
  ["morlock/core/stream","exports"],
  function(__dependency1__, __exports__) {
    
    var Stream = __dependency1__;

    /**
     * Create a new Stream containing resize events.
     * These events can be throttled (meaning they will only emit once every X milliseconds).
     * @param {object=} options Map of optional parameters.
     * @param {object} options.resizeStream Custom resize stream.
     * @param {number=200} options.throttleMs What rate to throttle the stream.
     * @param {number=100} options.orientationChangeDelayMs After rotation, how long do we wait to fire an event.
     * @return {Stream} The resulting stream.
     */
    function create(options) {
      options = options || {};
      var throttleMs = 'undefined' !== typeof options.throttleMs ? options.throttleMs : 200;
      var orientationChangeDelayMs = 'undefined' !== typeof options.orientationChangeDelayMs ? options.orientationChangeDelayMs : 100;
      var resizeStream = 'undefined' !== typeof options.resizeStream ?
        options.resizeStream :
        Stream.createFromEvents(window, 'resize');

      var resizedStream = Stream.merge(

        // Watch and throttle resize events;
        Stream.throttle(throttleMs, resizeStream),

        // X milliseconds after an orientation change, send an event.
        Stream.delay(orientationChangeDelayMs,
                     Stream.createFromEvents(window, 'orientationchange'))
      );

      setTimeout(function() {
        var evObj = document.createEvent('HTMLEvents');
        evObj.initEvent( 'resize', true, true );
        window.dispatchEvent(evObj);
      }, 10);

      return resizedStream;
    }


    __exports__.create = create;
  });
define("morlock/controllers/resize-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/breakpoint-stream","morlock/streams/resize-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    var objectKeys = __dependency1__.objectKeys;
    var partial = __dependency1__.partial;
    var equals = __dependency1__.equals;
    var first = __dependency1__.first;
    var compose = __dependency1__.compose;
    var isTrue = __dependency1__.isTrue;
    var select = __dependency1__.select;
    var get = __dependency1__.get;
    var shift = __dependency1__.shift;
    var nth = __dependency1__.nth;
    var Stream = __dependency2__;
    var BreakpointStream = __dependency3__;
    var ResizeStream = __dependency4__;

    /**
     * Provides a familiar OO-style API for tracking resize events.
     * @constructor
     * @param {Object=} options The options passed to the resize tracker.
     * @return {Object} The API with a `on` function to attach callbacks
     *   to resize events and breakpoint changes.
     */
    function ResizeController(options) {
      if (!(this instanceof ResizeController)) {
        return new ResizeController(options);
      }

      options = options || {};

      var resizeStream = ResizeStream.create(options);

      var breakpointStream;
      if ('undefined' !== typeof options.breakpoints) {
        breakpointStream = BreakpointStream.create(options.breakpoints, resizeStream);
      }

      this.on = function(eventType, cb) {
        if ('resize' === eventType) {
          Stream.onValue(Stream.map(function() {
            return [window.innerWidth, window.innerHeight];
          }, resizeStream), cb);
        } else if ('breakpoint' === eventType) {
          if (breakpointStream) {
            Stream.onValue(Stream.map(function(v) {
              return [first(v), v[1] ? 'enter' : 'exit'];
            }, breakpointStream), cb);
          } else {
            // No breakpoints defined.
          }
        }
      };

      var activeBreakpoints = {};

      if (breakpointStream) {
        Stream.onValue(breakpointStream, function(e) {
          activeBreakpoints[e[0]] = e[1];
        });
      }

      this.getActiveBreakpoints = function getActiveBreakpoints() {
        var isActive = compose(isTrue, partial(get, activeBreakpoints));
        return select(isActive, objectKeys(activeBreakpoints));
      };
    }

    __exports__["default"] = ResizeController;
  });
define("morlock/streams/scroll-stream", 
  ["morlock/core/stream","morlock/core/util","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    var Stream = __dependency1__;
    var documentScrollY = __dependency2__.documentScrollY;

    /**
     * Create a new Stream containing scroll events.
     * These events can be debounced (meaning they will only emit after events have
     * ceased for X milliseconds).
     * @param {object=} options Map of optional parameters.
     * @param {number=200} options.debounceMs What rate to debounce the stream.
     * @return {Stream} The resulting stream.
     */
    function create(options) {
      options = options || {};
      var debounceMs = 'undefined' !== typeof options.debounceMs ? options.debounceMs : 200;

      var scrollEndStream = Stream.debounce(
        debounceMs,
        createFromEvents()
      );

      // It's going to space, will you just give it a second!
      setTimeout(function() {
        var evObj = document.createEvent('HTMLEvents');
        evObj.initEvent( 'scroll', true, true );
        window.dispatchEvent(evObj);
      }, 10);

      return scrollEndStream;
    }

    function createFromEvents() {
      var oldScrollY;
      var scrollDirty = true;

      Stream.onValue(Stream.createFromEvents(window, 'scroll'), function() {
        scrollDirty = true;
      });

      var rAF = Stream.createFromRAF();

      var didChangeOnRAFStream = Stream.filter(function() {
        if (!scrollDirty) { return false; }
        scrollDirty = false;

        var newScrollY = documentScrollY();
        if (oldScrollY !== newScrollY) {
          oldScrollY = newScrollY;
          return true;
        }

        return false;
      }, rAF);

      return Stream.map(
        function getWindowPosition() {
          return oldScrollY;
        },
        didChangeOnRAFStream
      );
    }

    __exports__.create = create;
  });
define("morlock/streams/element-tracker-stream", 
  ["morlock/core/util","morlock/core/stream","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    var getViewportHeight = __dependency1__.getViewportHeight;
    var getRect = __dependency1__.getRect;
    var Stream = __dependency2__;

    /**
     * Create a new Stream containing events which fire when an element has
     * entered or exited the viewport.
     * @param {Element} element The element we are tracking.
     * @param {Stream} scrollStream A stream emitting scroll events.
     * @param {Stream} resizeStream A stream emitting resize events.
     * @return {Stream} The resulting stream.
     */
    function create(element, scrollStream, resizeStream) {
      var trackerStream = Stream.create();
      var viewportHeight;
      var isVisible = false;

      function updateViewport() {
        viewportHeight = getViewportHeight();
        didUpdateViewport();
      }
      
      function didUpdateViewport(currentScrollY) {
        var r = getRect(element, null, currentScrollY);
        var inY = !!r && r.bottom >= 0 && r.top <= viewportHeight;

        if (isVisible && !inY) {
          isVisible = false;
          Stream.emit(trackerStream, 'exit');
        } else if (!isVisible && inY) {
          isVisible = true;
          Stream.emit(trackerStream, 'enter');
        }
      }

      Stream.onValue(scrollStream, didUpdateViewport);
      Stream.onValue(resizeStream, updateViewport);
      updateViewport();

      return trackerStream;
    }

    __exports__.create = create;
  });
define("morlock/streams/scroll-tracker-stream", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/scroll-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    var getViewportHeight = __dependency1__.getViewportHeight;
    var getRect = __dependency1__.getRect;
    var Stream = __dependency2__;
    var ScrollStream = __dependency3__;

    /**
     * Create a new Stream containing events which fire when an element has
     * entered or exited the viewport.
     * @param {Element} element The element we are tracking.
     * @param {Stream} scrollStream A stream emitting scroll events.
     * @param {Stream} resizeStream A stream emitting resize events.
     * @return {Stream} The resulting stream.
     */
    function create(targetScrollY, scrollPositionStream) {
      scrollPositionStream = scrollPositionStream || ScrollStream.create({ debounceMs: 0 });
      var overTheLineStream = Stream.create();
      var pastScrollY = false;
      var firstRun = true;

      Stream.onValue(scrollPositionStream, function(currentScrollY){
        if ((firstRun || pastScrollY) && (currentScrollY < targetScrollY)) {
          pastScrollY = false;
          Stream.emit(overTheLineStream, ['before', targetScrollY]);
        } else if ((firstRun || !pastScrollY) && (currentScrollY >= targetScrollY)) {
          pastScrollY = true;
          Stream.emit(overTheLineStream, ['after', targetScrollY]);
        }

        firstRun = false;
      });

      setTimeout(function() {
        window.dispatchEvent(new Event('scroll'));
      }, 10);

      return overTheLineStream;
    }

    __exports__.create = create;
  });
define("morlock/controllers/scroll-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/scroll-stream","morlock/streams/resize-stream","morlock/streams/element-tracker-stream","morlock/streams/scroll-tracker-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __exports__) {
    
    var partial = __dependency1__.partial;
    var equals = __dependency1__.equals;
    var compose = __dependency1__.compose;
    var constantly = __dependency1__.constantly;
    var first = __dependency1__.first;
    var Stream = __dependency2__;
    var ScrollStream = __dependency3__;
    var ResizeStream = __dependency4__;
    var ElementTrackerStream = __dependency5__;
    var ScrollTrackerStream = __dependency6__;

    /**
     * Provides a familiar OO-style API for tracking scroll events.
     * @constructor
     * @param {Object=} options The options passed to the scroll tracker.
     * @return {Object} The API with a `on` function to attach scrollEnd
     *   callbacks and an `observeElement` function to detect when elements
     *   enter and exist the viewport.
     */
    function ScrollController(options) {
      if (!(this instanceof ScrollController)) {
        return new ScrollController(options);
      }

      this.id = ScrollController.nextID++;

      var scrollEndStream = ScrollStream.create(options);

      this.on = function(name, cb) {
        if ('scrollEnd' === name) {
          Stream.onValue(scrollEndStream, cb);
        }
      };

      var resizeStream = ResizeStream.create();

      ScrollController.instances[this.id] = this;

      // TODO: better tear down
      this.destroy = function destroy() {
        delete ScrollController.instances[this.id];
      };

      this.observeElement = function observeElement(elem) {
        var trackerStream = ElementTrackerStream.create(elem, scrollEndStream, resizeStream);

        var enterStream = Stream.filter(partial(equals, 'enter'), trackerStream);
        var exitStream = Stream.filter(partial(equals, 'exit'), trackerStream);

        function onOffStream(args, f) {
          var name = 'both';
          var cb;

          if (args.length === 1) {
            cb = args[0];
          } else {
            name = args[0];
            cb = args[1];
          }

          var filteredStream;
          if (name === 'both') {
            filteredStream = trackerStream;
          } else if (name === 'enter') {
            filteredStream = enterStream;
          } else if (name === 'exit') {
            filteredStream = exitStream;
          }

          f(filteredStream, cb);
          
          if ((f === Stream.onValue) && (trackerStream.value === name)) {
            Stream.emit(filteredStream, trackerStream.value);
          }
        }

        return {
          on: function on(/* name, cb */) {
            onOffStream(arguments, Stream.onValue);

            return this;
          },

          off: function(/* name, cb */) {
            onOffStream(arguments, Stream.offValue);

            return this;
          }
        };
      };

      this.observePosition = function observePosition(targetScrollY) {
        var trackerStream = ScrollTrackerStream.create(targetScrollY, scrollEndStream);

        var beforeStream = Stream.filterFirst('before', trackerStream);
        var afterStream = Stream.filterFirst('after', trackerStream);

        function onOffStream(args, f) {
          var name = 'both';
          var cb;

          if (args.length === 1) {
            cb = args[0];
          } else {
            name = args[0];
            cb = args[1];
          }

          var filteredStream;
          if (name === 'both') {
            filteredStream = trackerStream;
          } else if (name === 'before') {
            filteredStream = beforeStream;
          } else if (name === 'after') {
            filteredStream = afterStream;
          }

          f(filteredStream, cb);
        }

        return {
          on: function on(/* name, cb */) {
            onOffStream(arguments, Stream.onValue);

            return this;
          },

          off: function(/* name, cb */) {
            onOffStream(arguments, Stream.offValue);

            return this;
          }
        };
      };
    }

    ScrollController.instances = {};
    ScrollController.nextID = 1;

    __exports__["default"] = ScrollController;
  });
define("morlock/core/responsive-image", 
  ["morlock/core/util","morlock/controllers/scroll-controller","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    var map = __dependency1__.map;
    var mapObject = __dependency1__.mapObject;
    var partial = __dependency1__.partial;
    var sortBy = __dependency1__.sortBy;
    var parseInteger = __dependency1__.parseInteger;
    var set = __dependency1__.set;
    var flip = __dependency1__.flip;
    var testMQ = __dependency1__.testMQ;
    var ScrollController = __dependency2__["default"];

    var sharedSC = new ScrollController({
      debounceMs: 0
    });

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
      this.hasWebp = false;
      this.isFlexible = false;
      this.hasRetina = false;
      this.preserveAspectRatio = false;
      this.knownDimensions = null;
      this.hasLoaded = false;
    }

    function create(imageMap) {
      var image = new ResponsiveImage();

      mapObject(flip(partial(set, image)), imageMap);

      if (image.knownDimensions && image.preserveAspectRatio) {
        applyAspectRatioPadding(image);
      }

      if (imageMap.lazyLoad) {
        var observer = sharedSC.observeElement(imageMap.element);
        function onEnter() {
          observer.off('enter', onEnter);

          image.lazyLoad = false;
          update(image, true);
        };
        observer.on('enter', onEnter);
      }

      return image;
    }

    function createFromElement(element) {
      var imageMap = {};
      imageMap.element = element;
      imageMap.src = element.getAttribute('data-src');

      imageMap.lazyLoad = element.getAttribute('data-lazyload') === 'true';
      imageMap.hasWebp = element.getAttribute('data-hasWebp') === 'true';
      imageMap.isFlexible = element.getAttribute('data-isFlexible') !== 'false';
      imageMap.hasRetina = (element.getAttribute('data-hasRetina') === 'true') && (window.devicePixelRatio > 1.5);
      imageMap.preserveAspectRatio = element.getAttribute('data-preserveAspectRatio') === 'true';

      var dimensionsString = element.getAttribute('data-knownDimensions');
      if (dimensionsString && (dimensionsString !== 'false')) {
        imageMap.knownDimensions = [
          parseInteger(dimensionsString.split('x')[0]),
          parseInteger(dimensionsString.split('x')[1])
        ];
      }

      imageMap.knownSizes = getBreakpointSizes(imageMap.element);

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
      image.element.style.paddingBottom = ((image.knownDimensions[1] / image.knownDimensions[0]) * 100.0) + '%';
    }

    /**
     * Parse the breakpoints from the `data-breakpoints` attribute.
     * @param {Element} element The source element.
     * @return {Array} Sorted array of known sizes.
     */
    function getBreakpointSizes(element) {
      var breakpointString = element.getAttribute('data-breakpoints');

      var knownSizes = map(function(s) {
        return parseInteger(s);
      }, breakpointString ? breakpointString.split(',') : []);

      if (knownSizes.length <= 0) {
        return [0];
      } else {
        return sortBy(knownSizes, function sortAscending(a, b) {
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

      var foundBreakpoint;

      for (var i = 0; i < image.knownSizes.length; i++) {
        var s = image.knownSizes[i];
        var mq = 'only screen and (max-width: ' + s + 'px)';
        if (i === 0) {
          mq = 'only screen';
        }

        if (testMQ(mq)) {
          foundBreakpoint = s;
        } else {
          break;
        }
      }

      if (foundBreakpoint !== image.currentBreakpoint) {
        image.currentBreakpoint = foundBreakpoint;
        loadImageForBreakpoint(image, image.currentBreakpoint);
      }
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
        };

        img.src = getPath(image, s);
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
      image.element.style.backgroundImage = 'url(' + img.src + ')';

      if (image.preserveAspectRatio) {
        var sizeVar = Modernizr['prefixed']('backgroundSize');
        image.element.style[sizeVar] = 'cover';

        var w, h;

        if (image.knownDimensions) {
          w = image.knownDimensions[0];
          h = image.knownDimensions[1];
        } else {
          w = img.width;
          h = img.height;
        }

        if (image.isFlexible) {
          image.element.style.paddingBottom = ((h / w) * 100.0) + '%';
        } else {
          image.element.style.width = w + 'px';
          image.element.style.height = h + 'px';
        }
      }
    }

    /**
     * Get the path for the image given the current breakpoints and
     * browser features.
     * @param {String} s Requested path.
     * @return {String} The resulting path.
     */
    function getPath(image, s) {
      if (s === 0) { return image.src; }

      var parts = image.src.split('.');
      var currentExt = parts.pop();
      var ext = (image.hasWebp && Modernizr['webp']) ? 'webp' : currentExt;

      return parts.join('.') + '-' + s + (image.hasRetina ? '@2x' : '') + '.' + ext;
    }

    __exports__.create = create;
    __exports__.createFromElement = createFromElement;
    __exports__.update = update;
  });
define("morlock/plugins/jquery.breakpointer", 
  ["morlock/controllers/resize-controller"],
  function(__dependency1__) {
    
    var ResizeController = __dependency1__["default"];

    if ('undefined' !== typeof $) {

      $.fn.breakpointer = function() {

      };

    }
  });
define("morlock/plugins/jquery.scrolltracker", 
  ["morlock/controllers/scroll-controller"],
  function(__dependency1__) {
    
    var ScrollController = __dependency1__["default"];

    if ('undefined' !== typeof $) {

      $.fn.scrolltracker = function() {

      };

    }
  });
define("morlock/plugins/jquery.eventstream", 
  ["morlock/core/util","morlock/core/stream"],
  function(__dependency1__, __dependency2__) {
    
    var map = __dependency1__.map;
    var Stream = __dependency2__;

    if ('undefined' !== typeof $) {

      $.fn.eventstream = function(events) {
        var selectedNodes = this;

        var elementStreams = map(function(node) {
          var elementStream = Stream.create();

          var jQueryWrapper = $(node);

          jQueryWrapper.on(events, function(e) {
            Stream.emit(elementStream, e);
          });

          jQueryWrapper.data('stream', elementStream);

          return elementStream;
        }, selectedNodes);

        if (elementStreams.length > 1) {
          var outputStream = Stream.merge(elementStreams);
        }

        return selectedNodes;
      };

    }
  });
define("morlock/plugins/jquery.morlockResize", 
  ["morlock/controllers/resize-controller"],
  function(__dependency1__) {
    
    var ResizeController = __dependency1__["default"];

    if ('undefined' !== typeof jQuery) {

      jQuery.fn.morlockResize = function(cb, opts) {
        var rc = new ResizeController(opts);

        return $(this).each(function() {
          if (this === window) {
            var $this = $(this);
            $this.on('morlockResize', cb);
            rc.on('resize', function(e) {
              $this.trigger('morlockResize');
            });
          }
        });
      };

    }
  });
define("morlock/base", 
  ["morlock/controllers/resize-controller","morlock/controllers/scroll-controller","morlock/core/responsive-image","morlock/plugins/jquery.breakpointer","morlock/plugins/jquery.scrolltracker","morlock/plugins/jquery.eventstream","morlock/plugins/jquery.morlockResize","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
    
    var ResizeController = __dependency1__["default"];
    var ScrollController = __dependency2__["default"];
    var ResponsiveImage = __dependency3__;

    var sharedTrackers = {};
    var sharedPositions = {};

    function getScrollTracker(debounceMs) {
      debounceMs = 'undefined' !== typeof debounceMs ? debounceMs : 0;
      sharedTrackers[debounceMs] = sharedTrackers[debounceMs] || new ScrollController({ debounceMs: debounceMs });
      return sharedTrackers[debounceMs];
    }

    function getPositionTracker(pos) {
      sharedPositions[pos] = sharedPositions[pos] || morlock.observePosition(pos);
      return sharedPositions[pos];
    }

    var morlock = {
      onScrollEnd: function onScrollEnd(cb) {
        var st = getScrollTracker();
        return st.on('scrollEnd', cb);
      },

      observeElement: function observeElement() {
        var st = getScrollTracker();
        return st.observeElement.apply(st, arguments);
      },

      observePosition: function observePosition() {
        var st = getScrollTracker();
        return st.observePosition.apply(st, arguments);
      },

      position: {
        before: function(pos, cb) {
          var observer = getPositionTracker(pos);
          return observer.on('before', cb);
        },

        after: function(pos, cb) {
          var observer = getPositionTracker(pos);
          return observer.on('after', cb);
        }
      }
    };

    __exports__.ResizeController = ResizeController;
    __exports__.ResponsiveImage = ResponsiveImage;
    __exports__.ScrollController = ScrollController;
    __exports__.morlock = morlock;
  });
require(["morlock/base"]);
  //The modules for your project will be inlined above
  //this snippet. Ask almond to synchronously require the
  //module value for 'main' here and return it as the
  //value to use for the public API for the built file.
  return require('morlock/base');
}));