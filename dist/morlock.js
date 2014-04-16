/* Modernizr 2.7.1 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-backgroundsize-mq-addtest-prefixed-teststyles-testprop-testallprops-hasevent-prefixes-domprefixes-img_webp
 */
;window.Modernizr=function(a,b,c){function A(a){i.cssText=a}function B(a,b){return A(l.join(a+";")+(b||""))}function C(a,b){return typeof a===b}function D(a,b){return!!~(""+a).indexOf(b)}function E(a,b){for(var d in a){var e=a[d];if(!D(e,"-")&&i[e]!==c)return b=="pfx"?e:!0}return!1}function F(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:C(f,"function")?f.bind(d||b):f}return!1}function G(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+n.join(d+" ")+d).split(" ");return C(b,"string")||C(b,"undefined")?E(e,b):(e=(a+" "+o.join(d+" ")+d).split(" "),F(e,b,c))}var d="2.7.1",e={},f=b.documentElement,g="modernizr",h=b.createElement(g),i=h.style,j,k={}.toString,l=" -webkit- -moz- -o- -ms- ".split(" "),m="Webkit Moz O ms",n=m.split(" "),o=m.toLowerCase().split(" "),p={},q={},r={},s=[],t=s.slice,u,v=function(a,c,d,e){var h,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:g+(d+1),l.appendChild(j);return h=["&#173;",'<style id="s',g,'">',a,"</style>"].join(""),l.id=g,(m?l:n).innerHTML+=h,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=f.style.overflow,f.style.overflow="hidden",f.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),f.style.overflow=k),!!i},w=function(b){var c=a.matchMedia||a.msMatchMedia;if(c)return c(b).matches;var d;return v("@media "+b+" { #"+g+" { position: absolute; } }",function(b){d=(a.getComputedStyle?getComputedStyle(b,null):b.currentStyle)["position"]=="absolute"}),d},x=function(){function d(d,e){e=e||b.createElement(a[d]||"div"),d="on"+d;var f=d in e;return f||(e.setAttribute||(e=b.createElement("div")),e.setAttribute&&e.removeAttribute&&(e.setAttribute(d,""),f=C(e[d],"function"),C(e[d],"undefined")||(e[d]=c),e.removeAttribute(d))),e=null,f}var a={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"};return d}(),y={}.hasOwnProperty,z;!C(y,"undefined")&&!C(y.call,"undefined")?z=function(a,b){return y.call(a,b)}:z=function(a,b){return b in a&&C(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=t.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(t.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(t.call(arguments)))};return e}),p.backgroundsize=function(){return G("backgroundSize")};for(var H in p)z(p,H)&&(u=H.toLowerCase(),e[u]=p[H](),s.push((e[u]?"":"no-")+u));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)z(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof enableClasses!="undefined"&&enableClasses&&(f.className+=" "+(b?"":"no-")+a),e[a]=b}return e},A(""),h=j=null,e._version=d,e._prefixes=l,e._domPrefixes=o,e._cssomPrefixes=n,e.mq=w,e.hasEvent=x,e.testProp=function(a){return E([a])},e.testAllProps=G,e.testStyles=v,e.prefixed=function(a,b,c){return b?G(a,b,c):G(a,"pfx")},e}(this,this.document),function(){var a=new Image;a.onerror=function(){Modernizr.addTest("webp",!1)},a.onload=function(){Modernizr.addTest("webp",function(){return a.width==1})},a.src="data:image/webp;base64,UklGRiwAAABXRUJQVlA4ICAAAAAUAgCdASoBAAEAL/3+/3+CAB/AAAFzrNsAAP5QAAAAAA=="}();
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
    root.BreakpointController = parts.BreakpointController;
    root.ResponsiveImage = parts.ResponsiveImage;
    root.ScrollController = parts.ScrollController;
    root.ElementVisibleController = parts.ElementVisibleController;
    root.ScrollPositionController = parts.ScrollPositionController;
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

define("../../vendor/almond", function(){});

define("morlock/core/util", 
  ["exports"],
  function(__exports__) {
    
    var NATIVE_ARRAY_SLICE = Array.prototype.slice;

    /**
     * Slice an array.
     * @param {array} arr The original array.
     * @param {number} pos The position to slice from.
     * @return {array} New sliced array.
     */
    function slice(arr, pos) {
      return NATIVE_ARRAY_SLICE.call(arr, pos);
    }

    /**
     * Shallow copy an array.
     * @param {array} arr The original array.
     * @return {array} New copied array.
     */
    function copyArray(arr) {
      return slice(arr, 0);
    }

    var NATIVE_ARRAY_INDEXOF = Array.prototype.indexOf;

    /**
     * Backwards compatible Array.prototype.indexOf
     * @param {array} list List of items.
     * @param {object} item Item to search for.
     * @return {number} Index of match or -1 if not found.
     */
    function indexOf(list, item) {
      if (NATIVE_ARRAY_INDEXOF) {
        return NATIVE_ARRAY_INDEXOF.call(list, item);
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
     * @param {function} f The function.
     * @param {number} delay The delay in ms.
     * @return {function} A function which calls the passed-in function throttled.
     */
    function throttle(f, delay) {
      var timeoutId;
      var previous = 0;

      return function throttleExecute_() {
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
     * @param {function} f The function.
     * @param {number} delay The delay in ms.
     * @return {function} A function which calls the passed-in function debounced.
     */
    function debounce(f, delay) {
      var timeoutId = null;

      return function debounceExecute_() {
        clearTimeout(timeoutId);
        var lastArgs = arguments;

        timeoutId = setTimeout(function() {
          timeoutId = null;
          f.apply(null, lastArgs);
        }, delay);
      };
    }

    function identity(val) {
      return val;
    }

    __exports__.identity = identity;/**
     * Backwards compatible Media Query matcher.
     * @param {String} mq Media query to match.
     * @return {Boolean} Whether it matched.
     */
    var testMQ = Modernizr.mq;
    __exports__.testMQ = testMQ;
    function memoize(f, argsToStringFunc) {
      var cache = Object.create(null);

      argsToStringFunc = isDefined(argsToStringFunc) ? argsToStringFunc : JSON.stringify;

      return function memoizedExecute_() {
        var key = argsToStringFunc.apply(this, arguments);

        if (!isDefined(cache[key])) {
          cache[key] = f.apply(this, arguments);
        }

        return cache[key];
      };
    }

    __exports__.memoize = memoize;/**
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

    var getViewportWidth = makeViewportGetter_('width', 'innerWidth', 'clientWidth');
    __exports__.getViewportWidth = getViewportWidth;var getViewportHeight = makeViewportGetter_('height', 'innerHeight', 'clientHeight');
    __exports__.getViewportHeight = getViewportHeight;
    var detectedIE10_ = (navigator.userAgent.indexOf('MSIE 10') !== -1);

    /**
     * Get the document scroll.
     * @return {number}
     */
    function documentScrollY() {
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
    function getRect(elem, buffer, currentScrollY) {
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

    /**
     * Map a function over an object.
     * @param {object} obj The object.
     * @param {function} f The function.
     * @return {object} The resulting object.
     */
    function mapObject(f, obj) {
      return reduce(function mapObjectExecute_(sum, v) {
        sum[v] = f(obj[v], v);
        return sum;
      }, objectKeys(obj), {});
    }

    function unary(fn) {
      if (fn.length === 1) {
        return fn;
      } else {
        return function unaryExecute_(firstParam) {
          return fn.call(this, firstParam);
        };
      }
    }

    __exports__.unary = unary;var NATIVE_ARRAY_MAP = Array.prototype.map;

    /**
     * Map a function over an object.
     * @param {object} obj The object.
     * @param {function} f The function.
     * @return {object} The resulting object.
     */
    function map(f, arr) {
      if (NATIVE_ARRAY_MAP) {
        return arr ? NATIVE_ARRAY_MAP.call(arr, f) : arr;
      }

      var output = [];

      for (var i = 0; arr && i < arr.length; i++) {
        output.push(f(arr[i], i, arr));
      }

      return output;
    }

    var NATIVE_ARRAY_FOREACH = Array.prototype.forEach;

    /**
     * Loop a function over an object, for side-effects.
     * @param {object} obj The object.
     * @param {function} f The function.
     */
    function forEach(f, arr) {
      if (NATIVE_ARRAY_FOREACH) {
        if (arr) {
          NATIVE_ARRAY_FOREACH.call(arr, f);
        }

        return;
      }

      for (var i = 0; i < arr.length; i++) {
        f(arr[i], i, arr);
      }
    }

    __exports__.forEach = forEach;/**
     * Get the keys of an object.
     * @param {object} obj The object.
     * @return {array} An array of keys.
     */
    function objectKeys(obj) {
      if (!obj) { return null; }

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
     * @param {object} obj The object.
     * @param {String} key The key.
     * @return {object} Some result.
     */
    function get(obj, key) {
      return obj[key];
    }

    /**
     * Set a value on an object.
     * @param {object} obj The object.
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

    var NATIVE_ARRAY_REVERSE = Array.prototype.reverse;

    /**
     * Reverse the order of arguments.
     * @param {function} f The original function.
     * @return {function} The function with flipped arguments.
     */
    function flip(f) {
      return function flippedFunction_() {
        return apply(f, NATIVE_ARRAY_REVERSE.call(arguments));
      };
    }

    function isEmpty(arr) {
      return !(arr && arr.length);
    }

    function isDefined(val) {
      return 'undefined' !== typeof val;
    }

    __exports__.isDefined = isDefined;function getOption(val, defaultValue) {
      return isDefined(val) ? val : defaultValue;
    }

    __exports__.getOption = getOption;function objectVals(obj) {
      var getPropertyByName = partial(get, obj);
      return map(getPropertyByName, objectKeys(obj));
    }

    var NATIVE_ARRAY_REDUCE = Array.prototype.reduce;

    function reduce(f, arr, val) {
      if (NATIVE_ARRAY_REDUCE) {
        return arr ? NATIVE_ARRAY_REDUCE.call(arr, f, val) : val;
      }

      for (var i = 0; arr && i < arr.length; i++) {
        val = f(val, arr[i], i, arr);
      }

      return val;
    }

    var NATIVE_ARRAY_FILTER = Array.prototype.filter;

    function select(f, arr) {
      if (NATIVE_ARRAY_FILTER) {
        return arr ? NATIVE_ARRAY_FILTER.call(arr, f) : null;
      }

      var output = [];

      for (var i = 0; arr && i < arr.length; i++) {
        if (f(arr[i], i, arr) === true) {
          output.push(arr[i]);
        }
      }

      return output;
    }

    function reject(f, arr) {
      return select(compose(not, f), arr);
    }

    function not(v) {
      return !v;
    }

    // Recursive comparison function for `isEqual`.
    function eq(a, b, aStack, bStack) {
      // Identical objects are equal. `0 === -0`, but they aren't identical.
      // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
      if (a === b) {
        return a !== 0 || 1 / a == 1 / b;
      }

      // A strict comparison is necessary because `null == undefined`.
      if (a == null || b == null) {
        return a === b;
      }

      // Compare `[[Class]]` names.
      var className = a.toString();
      if (className != b.toString()) {
        return false;
      }
      switch (className) {
        // Strings, numbers, dates, and booleans are compared by value.
        case '[object String]':
          // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
          // equivalent to `new String("5")`.
          return a == String(b);
        case '[object Number]':
          // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
          // other numeric values.
          return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
        case '[object Date]':
        case '[object Boolean]':
          // Coerce dates and booleans to numeric primitive values. Dates are compared by their
          // millisecond representations. Note that invalid dates with millisecond representations
          // of `NaN` are not equivalent.
          return +a == +b;
        // RegExps are compared by their source patterns and flags.
        case '[object RegExp]':
          return a.source == b.source &&
                 a.global == b.global &&
                 a.multiline == b.multiline &&
                 a.ignoreCase == b.ignoreCase;
      }

      if (typeof a != 'object' || typeof b != 'object') {
        return false;
      }

      // Assume equality for cyclic structures. The algorithm for detecting cyclic
      // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
      var length = aStack.length;
      while (length--) {
        // Linear search. Performance is inversely proportional to the number of
        // unique nested structures.
        if (aStack[length] == a) {
          return bStack[length] == b;
        }
      }

      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               isFunction(bCtor) && (bCtor instanceof bCtor)) &&
          ('constructor' in a && 'constructor' in b)) {
        return false;
      }

      // Add the first object to the stack of traversed objects.
      aStack.push(a);
      bStack.push(b);

      var size = 0, result = true;
      // Recursively compare objects and arrays.
      if (className == '[object Array]') {
        // Compare array lengths to determine if a deep comparison is necessary.
        size = a.length;
        result = size == b.length;
        if (result) {
          // Deep compare the contents, ignoring non-numeric properties.
          while (size--) {
            if (!(result = eq(a[size], b[size], aStack, bStack))) {
              break;
            }
          }
        }
      } else {
        // Deep compare objects.
        for (var key in a) {
          if (has(a, key)) {
            // Count the expected number of properties.
            size++;
            // Deep compare each member.
            if (!(result = has(b, key) && eq(a[key], b[key], aStack, bStack))) {
              break;
            }
          }
        }
        // Ensure that both objects contain the same number of properties.
        if (result) {
          for (key in b) {
            if (has(b, key) && !(size--)) {
              break;
            }
          }
          result = !size;
        }
      }

      // Remove the first object from the stack of traversed objects.
      aStack.pop();
      bStack.pop();

      return result;
    }

    function isFunction(obj) {
      return typeof obj === 'function';
    }

    function has(obj, key) {
      return hasOwnProperty.call(obj, key);
    }

    function equals(a, b) {
      return eq(a, b, [], []);
    }

    function when(truth, f) {
      return function whenExecute_() {
        var whatIsTruth = truth; // Do not mutate original var :(

        if ('function' === typeof truth) {
          whatIsTruth = apply(truth, arguments);
        }

        if (whatIsTruth) {
          return apply(f, arguments);
        }
      };
    }

    var NATIVE_FUNCTION_BIND = Function.prototype.bind;

    /**
     * Bind a function's "this" value.
     * @param {function} f The function.
     * @param {object} obj The object.
     * @return {function} The bound function.
     */
    function functionBind(f, obj) {
      if (NATIVE_FUNCTION_BIND) {
        return NATIVE_FUNCTION_BIND.call(f, obj);
      }

      return function boundFunction_() {
        return f.apply(obj, arguments);
      };
    }

    /**
     * Partially apply a function.
     */
    function partial(f /*, args*/) {
      var args = rest(arguments);

      if (NATIVE_FUNCTION_BIND) {
        args.unshift(undefined);
        return NATIVE_FUNCTION_BIND.apply(f, args);
      }

      return function partialExecute_() {
        var args2 = slice(arguments, 0);
        return f.apply(this, args.concat(args2));
      };
    }

    function delay(f, ms) {
      return function delayedExecute_() {
        setTimeout(partial(f, arguments), ms);
      };
    }

    function defer(f, ms) {
      return delay(f, isDefined(ms) ? ms : 1)();
    }

    function apply(f, args) {
      return f.apply(null, args);
    }

    function rest(arr, fromStart) {
      fromStart = isDefined(fromStart) ? fromStart : 1;
      return slice(arr, fromStart);
    }

    function call(f /*, args */) {
      return apply(f, rest(arguments));
    }

    var flippedCall = flip(call);
    __exports__.flippedCall = flippedCall;
    function nth(idx, arr) {
      return arr[idx];
    }

    function first(arr) {
      return arr[0];
    }

    function last(arr) {
      return arr[arr.length - 1];
    }

    var NATIVE_ARRAY_UNSHIFT = Array.prototype.unshift;
    var NATIVE_ARRAY_SHIFT = Array.prototype.shift;
    var NATIVE_ARRAY_PUSH = Array.prototype.push;
    var NATIVE_ARRAY_POP = Array.prototype.pop;
    var NATIVE_ARRAY_SORT = Array.prototype.sort;

    function unshift(arr, v) {
      var arr2 = copyArray(arr);
      NATIVE_ARRAY_UNSHIFT.call(arr2, v);
      return arr2;
    }

    function shift(arr, v) {
      var arr2 = copyArray(arr);
      NATIVE_ARRAY_SHIFT.call(arr2, v);
      return arr2;
    }

    function push(arr, v) {
      var arr2 = copyArray(arr);
      NATIVE_ARRAY_PUSH.call(arr2, v);
      return arr2;
    }

    function pop(arr, v) {
      var arr2 = copyArray(arr);
      NATIVE_ARRAY_POP.call(arr2, v);
      return arr2;
    }

    function sortBy(arr, f) {
      var arr2 = copyArray(arr);
      NATIVE_ARRAY_SORT.call(arr2, f);
      return arr2;
    }

    function compose(/*fns*/) {
      var fns = arguments;

      return function composedExecute_(value) {
        for (var i = fns.length - 1; i >= 0; --i) {
          value = fns[i](value);
        }
        return value;
      };
    }

    var pipeline = flip(compose);
    __exports__.pipeline = pipeline;
    function once(f /*, args*/) {
      var args = rest(arguments);
      var hasRun = false;
      return function onceExecute_() {
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
      return function constantlyExecute_() {
        return val;
      };
    }

    var rAF = (function() {
      var correctRAF = window.requestAnimationFrame;
      var lastTime = 0;
      var vendors = ['webkit', 'moz'];

      for (var x = 0; x < vendors.length && !correctRAF; ++x) {
        correctRAF = window[vendors[x]+'RequestAnimationFrame'];
      }

      if (!correctRAF) {
        correctRAF = function rAFFallback_(callback) {
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
    __exports__.get = get;
    __exports__.shift = shift;
    __exports__.when = when;
    __exports__.reduce = reduce;
    __exports__.once = once;
    __exports__.sortBy = sortBy;
    __exports__.parseInteger = parseInteger;
    __exports__.set = set;
    __exports__.flip = flip;
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
define("morlock/core/events", 
  ["exports"],
  function(__exports__) {
    
    var registry_ = [];

    var addEventListener_ = window.addEventListener || function fallbackAddRemoveEventListener_(type, listener) {
      var target = this;

      registry_.unshift([target, type, listener, function (event) {
        event.currentTarget = target;
        event.preventDefault = function () { event.returnValue = false; };
        event.stopPropagation = function () { event.cancelBubble = true; };
        event.target = event.srcElement || target;

        listener.call(target, event);
      }]);

      this.attachEvent('on' + type, registry_[0][3]);
    };

    var removeEventListener_ = window.removeEventListener || function fallbackRemoveEventListener_(type, listener) {
      for (var index = 0, register; (register = registry_[index]); ++index) {
        if (register[0] == this && register[1] == type && register[2] == listener) {
          return this.detachEvent('on' + type, registry_.splice(index, 1)[0][3]);
        }
      }
    };

    var dispatchEvent_ = window.dispatchEvent || function (eventObject) {
      return this.fireEvent('on' + eventObject.type, eventObject);
    };

    var eventListenerInfo = { count: 0 };
    __exports__.eventListenerInfo = eventListenerInfo;
    function eventListener(target, eventName, cb) {
      addEventListener_.call(target, eventName, cb, false);
      eventListenerInfo.count++;

      return function eventListenerRemove_() {
        removeEventListener_.call(target, eventName, cb, false);
        eventListenerInfo.count--;
      };
    }

    __exports__.eventListener = eventListener;function dispatchEvent(target, evType) {
      var evObj = document.createEvent('HTMLEvents');
      evObj.initEvent(evType, true, true);
      dispatchEvent_.call(target, evObj);
    }

    __exports__.dispatchEvent = dispatchEvent;
  });
define("morlock/core/buffer", 
  ["exports"],
  function(__exports__) {
    
    /**
     * Ghetto Record implementation.
     */
    function Buffer(max, mode) {
      if (!(this instanceof Buffer)) {
        return new Buffer(max);
      }

      this.max = max;
      this.singleValueMode = this.max === 1;

      this.mode = mode;

      this.values = null;

      // Single item optimization
      this.singleValue = null; 
    }

    function create(max, mode) {
      return new Buffer(max, mode);
    }

    __exports__.create = create;function len(buffer) {
      if (buffer.singleValueMode) {
        return buffer.singleValue ? 1 : 0;
      } else {
        return buffer.values ? buffer.values.length : 0;
      }
    }

    __exports__.len = len;function push(buffer, value) {
      if (len(buffer) === buffer.max) {
        if (!buffer.singleValueMode && ('sliding' === buffer.mode)) {
          buffer.values.shift();
        } else if ('dropping' === buffer.mode) {
          return;
        }
      }

      if (buffer.singleValueMode) {
        buffer.singleValue = value;
      } else {
        if (!len(buffer)) {
          buffer.values = [];
        }

        buffer.values.push(value);
      }
    }

    __exports__.push = push;function lastValue(buffer) {
      if (buffer.singleValueMode) {
        return buffer.singleValue;
      } else {
        return buffer.values && buffer.values[buffer.values.length - 1];
      }
    }

    __exports__.lastValue = lastValue;function fill(buffer, value) {
      if (buffer.singleValueMode) {
        buffer.singleValue = buffer.singleValue || value;
      } else {
        while (!buffer.values || (buffer.values.length < buffer.max)) {
          push(buffer, value);
        }
      }
    }

    __exports__.fill = fill;function sum(buffer) {
      if (buffer.singleValueMode) {
        return buffer.singleValue;
      }

      var total = 0;

      for (var i = 0; buffer.values, i < buffer.values.length; i++) {
        total += buffer.values[i];
      }

      return total;
    }

    __exports__.sum = sum;function average(buffer) {
      if (buffer.singleValueMode) {
        return buffer.singleValue;
      }

      var total = sum(buffer);
      
      if (buffer.values) {
        return buffer.values.length ? (total / buffer.values.length) : 0;
      } else {
        return null;
      }
    }

    __exports__.average = average;function clear(buffer) {
      if (buffer.singleValueMode) {
        buffer.singleValue = null;
      } else {
        if (buffer.values) {
          buffer.values.length = 0;
          buffer.values = null;
        }
      }
    }

    __exports__.clear = clear;
  });
define("morlock/core/stream", 
  ["morlock/core/events","morlock/core/buffer","morlock/core/util","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    var eventListener = __dependency1__.eventListener;
    var createBuffer = __dependency2__.create;
    var pushBuffer = __dependency2__.push;
    var clearBuffer = __dependency2__.clear;
    var lastBufferValue = __dependency2__.lastValue;
    var debounceCall = __dependency3__.debounce;
    var throttleCall = __dependency3__.throttle;
    var delayCall = __dependency3__.delay;
    var mapArray = __dependency3__.map;
    var memoize = __dependency3__.memoize;
    var first = __dependency3__.first;
    var apply = __dependency3__.apply;
    var compose = __dependency3__.compose;
    var when = __dependency3__.when;
    var equals = __dependency3__.equals;
    var unary = __dependency3__.unary;
    var flippedCall = __dependency3__.flippedCall;
    var isDefined = __dependency3__.isDefined;
    var partial = __dependency3__.partial;
    var once = __dependency3__.once;
    var copyArray = __dependency3__.copyArray;
    var indexOf = __dependency3__.indexOf;
    var rAF = __dependency3__.rAF;

    // Internal tracking of how many streams have been created.
    var nextID = 0;

    var openStreams = {};
    __exports__.openStreams = openStreams;
    /**
     * Ghetto Record implementation.
     */
    function Stream(trackSubscribers, buffer) {
      if (!(this instanceof Stream)) {
        return new Stream(trackSubscribers, buffer);
      }

      this.trackSubscribers = !!trackSubscribers;
      this.subscribers = null;
      this.subscriberSubscribers = null;
      this.streamID = nextID++;
      this.values = isDefined(buffer) ? buffer : createBuffer(1, 'sliding');
      this.closed = false;
      this.closeSubscribers = null;
      this.emptySubscribers = null;

      openStreams[this.streamID] = this;
    }

    function create(trackSubscribers, buffer) {
      return new Stream(trackSubscribers, buffer);
    }

    function emit(stream, val) {
      if (stream.closed) { return; }

      mapArray(unary(partial(flippedCall, val)), stream.subscribers);

      pushBuffer(stream.values, val);
    }

    function getValue(stream) {
      return lastBufferValue(stream.values);
    }

    function onValue(stream, f) {
      if (stream.closed) { return; }

      stream.subscribers = stream.subscribers || [];
      stream.subscribers.push(f);

      if (stream.trackSubscribers) {
        mapArray(unary(partial(flippedCall, f)), stream.subscriberSubscribers);
      }

      return partial(offValue, stream, f);
    }

    function close(stream) {
      if (stream.closed) { return; }

      stream.closed = true;
      clearBuffer(stream.values);

      if (stream.subscribers) {
        stream.subscribers.length = 0;
      }

      if (stream.closeSubscribers) {
        mapArray(flippedCall, stream.closeSubscribers);
        stream.closeSubscribers.length = 0;
      }

      delete openStreams[stream.streamID];
    }

    __exports__.close = close;function offValue(stream, f) {
      if (stream.subscribers) {
        var idx = indexOf(stream.subscribers, f);
        if (idx !== -1) {
          stream.subscribers.splice(idx, 1);
        }

        if (stream.subscribers.length < 1) {
          stream.subscribers = null;
          mapArray(flippedCall, stream.emptySubscribers);
        }
      }
    }

    function onSubscription(stream, f) {
      if (stream.trackSubscribers) {
        stream.subscriberSubscribers || (stream.subscriberSubscribers = []);
        stream.subscriberSubscribers.push(f);
      }
    }

    function onClose(stream, f) {
      stream.closeSubscribers || (stream.closeSubscribers = []);
      stream.closeSubscribers.push(f);
    }

    __exports__.onClose = onClose;function onEmpty(stream, f) {
      stream.emptySubscribers || (stream.emptySubscribers = []);
      stream.emptySubscribers.push(f);
    }

    __exports__.onEmpty = onEmpty;function createFromEvents(target, eventName) {
      var outputStream = create(true);
      var boundEmit = partial(emit, outputStream);

      var isListening = false;
      var unsubFunc;

      function detachListener_() {
        if (!isListening) { return; }

        if (unsubFunc) {
          unsubFunc();
          unsubFunc = null;
          isListening = false;
        }
      }

      /**
       * Lazily subscribes to a dom event.
       */
      function attachListener_() {
        if (isListening) { return; }
        isListening = true;

        unsubFunc = eventListener(target, eventName, function() {
          if (outputStream.closed) {
            detachListener_();
          } else {
            apply(boundEmit, arguments);
          }
        });

        onClose(outputStream, detachListener_);
      }

      onSubscription(outputStream, attachListener_);
      onEmpty(outputStream, detachListener_);

      return outputStream;
    }

    function interval(ms) {
      var outputStream = create(true);
      var boundEmit = partial(emit, outputStream);

      /**
       * Lazily subscribes to a timeout event.
       */
      var attachListener = function attach_() {
        var intervalId = setInterval(function() {
          if (outputStream.closed) {
            clearInterval(intervalId);
          } else {
            apply(boundEmit, arguments);
          }
        }, ms);
      };

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

    var createFromRAF = memoize(function createFromRAF_() {
      var rAFStream = create(true);
      var boundEmit = partial(emit, rAFStream);

      /**
       * Lazily subscribes to a raf event.
       */
      function sendEvent(t) {
        if (!rAFStream.closed) {
          boundEmit(t);
          rAF(sendEvent);
        }
      }

      onSubscription(rAFStream, once(sendEvent));

      return rAFStream;
    });

    function merge(/* streams */) {
      var streams = copyArray(arguments);
      var outputStream = create();
      var boundEmit = partial(emit, outputStream);
      
      // var childStreams = {};

      // Map used for side-effects
      mapArray(function(stream) {
        // childStreams[stream.streamID] = true;

        var offValFunc = onValue(stream, boundEmit);
        onClose(outputStream, offValFunc);

        // function cleanup() {
        //   delete childStreams[stream.streamID];

        //   if (objectKeys(childStreams).length < 1) {
        //     close(outputStream);
        //   }
        // }

        // onClose(stream, cleanup);
        // onEmpty(stream, cleanup);
      }, streams);

      // onEmpty(outputStream, function() {
      //   debugger;
      // });

      return outputStream;
    }

    var EMIT_KEY = ':e:';

    function _duplicateStreamOnEmit(stream, f, args) {
      var outputStream = create();
      var boundEmit = partial(emit, outputStream);
      var boundArgs = mapArray(function(v) {
        return v === EMIT_KEY ? boundEmit : v;
      }, args);

      // var offValFunc = 
      onValue(stream, apply(apply, [f, boundArgs]));
      // onClose(outputStream, offValFunc);
      // onEmpty(outputStream, partial(close, outputStream));

      return outputStream;
    }

    function delay(ms, stream) {
      if (ms <= 0) { return stream; }
      return _duplicateStreamOnEmit(stream, delayCall, [EMIT_KEY, ms]);
    }

    function throttle(ms, stream) {
      if (ms <= 0) { return stream; }
      return _duplicateStreamOnEmit(stream, throttleCall, [EMIT_KEY, ms]);
    }

    function debounce(ms, stream) {
      if (ms <= 0) { return stream; }
      return _duplicateStreamOnEmit(stream, debounceCall, [EMIT_KEY, ms]);
    }

    function map(f, stream) {
      return _duplicateStreamOnEmit(stream, compose, [EMIT_KEY, f]);
    }

    function filter(f, stream) {
      return _duplicateStreamOnEmit(stream, when, [f, EMIT_KEY]);
    }

    function filterFirst(val, stream) {
      return filter(compose(partial(equals, val), first), stream);
    }

    function skipDuplicates(stream) {
      var lastValue;
      return filter(function(val) {
        if (equals(lastValue, val)) {
          return false;
        }
        
        lastValue = val;
        return true;
      }, stream);
    }

    __exports__.skipDuplicates = skipDuplicates;function sample(sourceStream, sampleStream) {
      return _duplicateStreamOnEmit(sampleStream,
        compose, [EMIT_KEY, partial(getValue, sourceStream)]);
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
define("morlock/streams/resize-stream", 
  ["morlock/core/stream","morlock/core/util","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    var Stream = __dependency1__;
    var getOption = __dependency2__.getOption;
    var memoize = __dependency2__.memoize;
    var defer = __dependency2__.defer;
    var partial = __dependency2__.partial;

    /**
     * Create a new Stream containing resize events.
     * These events can be throttled (meaning they will only emit once every X milliseconds).
     * @param {object=} options Map of optional parameters.
     * @param {number=100} options.orientationChangeDelayMs After rotation, how long do we wait to fire an event.
     * @return {Stream} The resulting stream.
     */
    var create = memoize(function create_(options) {
      options = options || {};
      var orientationChangeDelayMs = getOption(options.orientationChangeDelayMs, 100);

      var resizeEventStream = Stream.createFromEvents(window, 'resize');
      var orientationChangeStream = Stream.createFromEvents(window, 'orientationchange');

      var resizedStream = Stream.merge(
        resizeEventStream,

        // X milliseconds after an orientation change, send an event.
        Stream.delay(orientationChangeDelayMs, orientationChangeStream)
      );

      defer(partial(Stream.emit, resizedStream), 10);

      return Stream.skipDuplicates(Stream.map(windowDimensions_, resizedStream));
    });
    __exports__.create = create;
    function windowDimensions_() {
      return [
        window.innerWidth  || document.documentElement.clientWidth  || document.body.clientWidth,
        window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      ];
    }
  });
define("morlock/controllers/resize-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/resize-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    var getOption = __dependency1__.getOption;
    var Stream = __dependency2__;
    var ResizeStream = __dependency3__;

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

      var debounceMs = getOption(options.debounceMs, 200);
      var resizeEndStream = debounceMs <= 0 ? resizeStream : Stream.debounce(
        debounceMs,
        resizeStream
      );

      function onOffStream(args, f) {
        var name = args[0];
        var cb = args[1];

        var filteredStream;
        if (name === 'resizeEnd') {
          filteredStream = resizeEndStream;
        } else if (name === 'resize') {
          filteredStream = resizeStream;
        }

        if (filteredStream) {
          f(filteredStream, cb);
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
        },

        destroy: function() {
          Stream.close(resizeStream);
        }
      };
    }

    __exports__["default"] = ResizeController;
  });
define("morlock/streams/breakpoint-stream", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/resize-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    var objectVals = __dependency1__.objectVals;
    var partial = __dependency1__.partial;
    var mapObject = __dependency1__.mapObject;
    var apply = __dependency1__.apply;
    var push = __dependency1__.push;
    var testMQ = __dependency1__.testMQ;
    var getOption = __dependency1__.getOption;
    var Stream = __dependency2__;
    var ResizeStream = __dependency3__;

    /**
     * Create a new Stream containing events which fire when the browser
     * enters and exits breakpoints (media queries).
     * @param {Object} breakpoints Map containing the name of each breakpoint
     *   as the key. The value can be either a media query string or a map
     *   with min and/or max keys.
     * @return {Stream} The resulting stream.
     */
    function create(breakpoints, options) {
      var baseStream = ResizeStream.create();
      var resizeStream;

      if (options.debounceMs) {
        resizeStream = Stream.debounce(
          options.debounceMs,
          baseStream
        );
      } else if (options.throttleMs) {
        resizeStream = Stream.throttle(
          options.throttleMs,
          baseStream
        );
      } else {
        resizeStream = baseStream;
      }

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

    __exports__.create = create;/**
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
        var max = getOption(options.max, Infinity);
        var min = getOption(options.min, 0);

        mq = 'only screen';
        if (max < Infinity) {
          mq += ' and (max-width: ' + max + 'px)';
        }
        if (min > 0) {
          mq += ' and (min-width: ' + min + 'px)';
        }
      }

      return mq;
    }
  });
define("morlock/controllers/breakpoint-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/breakpoint-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    var objectKeys = __dependency1__.objectKeys;
    var partial = __dependency1__.partial;
    var first = __dependency1__.first;
    var compose = __dependency1__.compose;
    var isTrue = __dependency1__.isTrue;
    var select = __dependency1__.select;
    var get = __dependency1__.get;
    var Stream = __dependency2__;
    var BreakpointStream = __dependency3__;

    /**
     * Provides a familiar OO-style API for tracking breakpoint events.
     * @constructor
     * @param {Object=} options The options passed to the breakpoint tracker.
     * @return {Object} The API with a `on` function to attach callbacks
     *   to breakpoint changes.
     */
    function BreakpointController(options) {
      if (!(this instanceof BreakpointController)) {
        return new BreakpointController(options);
      }

      var breakpointStream = BreakpointStream.create(options.breakpoints, {
        throttleMs: options.throttleMs,
        debounceMs: options.debounceMs
      });

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

      function onOffStream(args, f) {
        var eventType = args[0];
        var cb = args[1];

        var filteredStream;

        if (eventType.match(/^breakpoint/)) {
          var parts = eventType.split(':');

          if (parts.length > 1) {
            filteredStream = Stream.filterFirst(parts[1], breakpointStream);
          } else {
            filteredStream = breakpointStream;
          }

          filteredStream = Stream.map(mapToNamedEvents_, filteredStream);
        }

        if (filteredStream) {
          f(filteredStream, cb);
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
    }

    var ENTER = 'enter';
    var EXIT = 'exit';

    function mapToNamedEvents_(v) {
      return [first(v), v[1] ? ENTER : EXIT];
    }

    __exports__["default"] = BreakpointController;
  });
define("morlock/streams/scroll-stream", 
  ["morlock/core/stream","morlock/core/util","morlock/core/events","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    var Stream = __dependency1__;
    var documentScrollY = __dependency2__.documentScrollY;
    var memoize = __dependency2__.memoize;
    var defer = __dependency2__.defer;
    var partial = __dependency2__.partial;
    var dispatchEvent = __dependency3__.dispatchEvent;

    /**
     * Create a stream of window.onscroll events, but only calculate their
     * position on requestAnimationFrame frames.
     * @return {Stream}
     */
    var create = memoize(function create_() {
      var oldScrollY;
      var scrollDirty = true;
      var scrollEventsStream = Stream.createFromEvents(window, 'scroll');

      Stream.onValue(scrollEventsStream, function onScrollSetDirtyBit_() {
        scrollDirty = true;
      });

      var rAF = Stream.createFromRAF();

      var didChangeOnRAFStream = Stream.filter(function filterDirtyFramesFromRAF_() {
        if (!scrollDirty) { return false; }
        scrollDirty = false;

        var newScrollY = documentScrollY();
        if (oldScrollY !== newScrollY) {
          oldScrollY = newScrollY;
          return true;
        }

        return false;
      }, rAF);

      // It's going to space, will you just give it a second!
      defer(partial(dispatchEvent, window, 'scroll'), 10);

      return Stream.map(function getWindowPosition_() {
        return oldScrollY;
      }, didChangeOnRAFStream);
    });
    __exports__.create = create;
  });
define("morlock/controllers/scroll-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/scroll-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    var getOption = __dependency1__.getOption;
    var Stream = __dependency2__;
    var ScrollStream = __dependency3__;

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

      options = options || {};

      var scrollStream = ScrollStream.create();

      var debounceMs = getOption(options.debounceMs, 200);
      var scrollEndStream = Stream.debounce(
        debounceMs,
        scrollStream
      );

      function onOffStream(args, f) {
        var name = args[0];
        var cb = args[1];

        var filteredStream;
        if (name === 'scrollEnd') {
          filteredStream = scrollEndStream;
        } else if (name === 'scroll') {
          filteredStream = scrollStream;
        }

        if (filteredStream) {
          f(filteredStream, cb);
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
    }

    __exports__["default"] = ScrollController;
  });
define("morlock/streams/element-tracker-stream", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/scroll-stream","morlock/streams/resize-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    var getViewportHeight = __dependency1__.getViewportHeight;
    var getRect = __dependency1__.getRect;
    var getOption = __dependency1__.getOption;
    var Stream = __dependency2__;
    var ScrollStream = __dependency3__;
    var ResizeStream = __dependency4__;

    /**
     * Create a new Stream containing events which fire when an element has
     * entered or exited the viewport.
     * @param {Element} element The element we are tracking.
     * @param {object} options Key/value options
     * @return {Stream} The resulting stream.
     */
    function create(element, resizeStream, options) {
      var trackerStream = Stream.create();
      var viewportHeight;
      var isVisible = false;

      options = options || {};
      var buffer = getOption(options.buffer, 0);

      function updateViewport() {
        viewportHeight = getViewportHeight();
        didUpdateViewport();
      }
      
      function didUpdateViewport(currentScrollY) {
        var r = getRect(element, buffer, currentScrollY);
        var inY = !!r && r.bottom >= 0 && r.top < viewportHeight;

        if (isVisible && !inY) {
          isVisible = false;
          Stream.emit(trackerStream, 'exit');
        } else if (!isVisible && inY) {
          isVisible = true;
          Stream.emit(trackerStream, 'enter');
        }
      }

      Stream.onValue(ScrollStream.create(), didUpdateViewport);
      Stream.onValue(ResizeStream.create(), updateViewport);
      updateViewport();

      return trackerStream;
    }

    __exports__.create = create;
  });
define("morlock/controllers/element-visible-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/element-tracker-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    var partial = __dependency1__.partial;
    var equals = __dependency1__.equals;
    var Stream = __dependency2__;
    var ElementTrackerStream = __dependency3__;

    /**
     * Provides a familiar OO-style API for tracking element position.
     * @constructor
     * @param {Element} elem The element to track
     * @param {Object=} options The options passed to the position tracker.
     * @return {Object} The API with a `on` function to attach scrollEnd
     *   callbacks and an `observeElement` function to detect when elements
     *   enter and exist the viewport.
     */
    function ElementVisibleController(elem, options) {
      if (!(this instanceof ElementVisibleController)) {
        return new ElementVisibleController(elem, options);
      }

      var trackerStream = ElementTrackerStream.create(elem, options);

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
        
        var val = Stream.getValue(trackerStream);
        if ((f === Stream.onValue) && (val === name)) {
          Stream.emit(filteredStream, val);
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
    }

    __exports__["default"] = ElementVisibleController;
  });
define("morlock/streams/scroll-tracker-stream", 
  ["morlock/core/stream","morlock/streams/scroll-stream","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    var Stream = __dependency1__;
    var ScrollStream = __dependency2__;

    /**
     * Create a new Stream containing events which fire when a position has
     * been scrolled past.
     * @param {number} targetScrollY The position we are tracking.
     * @return {Stream} The resulting stream.
     */
    function create(targetScrollY) {
      var scrollPositionStream = ScrollStream.create();
      var overTheLineStream = Stream.create();
      var pastScrollY = false;
      var firstRun = true;

      Stream.onValue(scrollPositionStream, function onScrollTrackPosition_(currentScrollY) {
        if ((firstRun || pastScrollY) && (currentScrollY < targetScrollY)) {
          pastScrollY = false;
          Stream.emit(overTheLineStream, ['before', targetScrollY]);
        } else if ((firstRun || !pastScrollY) && (currentScrollY >= targetScrollY)) {
          pastScrollY = true;
          Stream.emit(overTheLineStream, ['after', targetScrollY]);
        }

        firstRun = false;
      });

      return overTheLineStream;
    }

    __exports__.create = create;
  });
define("morlock/controllers/scroll-position-controller", 
  ["morlock/core/stream","morlock/streams/scroll-tracker-stream","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    var Stream = __dependency1__;
    var ScrollTrackerStream = __dependency2__;

    /**
     * Provides a familiar OO-style API for tracking scroll position.
     * @constructor
     * @param {Element} targetScrollY The position to track.
     * @return {Object} The API with a `on` function to attach scrollEnd
     *   callbacks and an `observeElement` function to detect when elements
     *   enter and exist the viewport.
     */
    function ScrollPositionController(targetScrollY) {
      if (!(this instanceof ScrollPositionController)) {
        return new ScrollPositionController(targetScrollY);
      }

      var trackerStream = ScrollTrackerStream.create(targetScrollY);
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
    }

    __exports__["default"] = ScrollPositionController;
  });
define("morlock/core/responsive-image", 
  ["morlock/core/util","morlock/controllers/element-visible-controller","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    var map = __dependency1__.map;
    var mapObject = __dependency1__.mapObject;
    var partial = __dependency1__.partial;
    var sortBy = __dependency1__.sortBy;
    var parseInteger = __dependency1__.parseInteger;
    var set = __dependency1__.set;
    var flip = __dependency1__.flip;
    var testMQ = __dependency1__.testMQ;
    var ElementVisibleController = __dependency2__["default"];

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
        var observer = new ElementVisibleController(imageMap.element);
        observer.on('enter', function onEnter_() {
          observer.off('enter', onEnter_);

          image.lazyLoad = false;
          update(image, true);
        });
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
        var sizeVar = Modernizr.prefixed('backgroundSize');
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
      var ext = (image.hasWebp && Modernizr.webp) ? 'webp' : currentExt;

      return parts.join('.') + '-' + s + (image.hasRetina ? '@2x' : '') + '.' + ext;
    }

    __exports__.create = create;
    __exports__.createFromElement = createFromElement;
    __exports__.update = update;
  });
define("morlock/base", 
  ["morlock/controllers/resize-controller","morlock/controllers/breakpoint-controller","morlock/controllers/scroll-controller","morlock/controllers/element-visible-controller","morlock/controllers/scroll-position-controller","morlock/core/responsive-image","morlock/core/util","morlock/core/events","morlock/core/buffer","morlock/core/stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __exports__) {
    
    var ResizeController = __dependency1__["default"];
    var BreakpointController = __dependency2__["default"];
    var ScrollController = __dependency3__["default"];
    var ElementVisibleController = __dependency4__["default"];
    var ScrollPositionController = __dependency5__["default"];
    var ResponsiveImage = __dependency6__;
    var Util = __dependency7__;
    var Events = __dependency8__;
    var Buffer = __dependency9__;
    var Stream = __dependency10__;

    var sharedPositions = {};
    var sharedBreakpointDefs = [];
    var sharedBreakpointsVals = [];

    var getResizeTracker = Util.memoize(function() {
      return new ResizeController();
    });

    var getScrollTracker = Util.memoize(function() {
      return new ScrollController();
    });

    function getPositionTracker(pos) {
      sharedPositions[pos] = sharedPositions[pos] || morlock.observePosition(pos);
      return sharedPositions[pos];
    }

    function getBreakpointTracker(def) {
      var found = false;
      for (var i = 0; i < sharedBreakpointDefs.length; i++) {
        if (Util.equals(sharedBreakpointDefs[i], def)) {
          found = true;
          break;
        }
      }

      if (found) {
        return sharedBreakpointsVals[i];
      } else {
        var controller = new BreakpointController(def);
        sharedBreakpointDefs.push(def);
        sharedBreakpointsVals.push(controller);
        return controller;
      }
    }

    function defineJQueryPlugins($) {
      $.fn.morlockResize = function() {
        return $(this).each(function() {
          if (this !== window) {
            // console.log('must attach event to window', this);
            return;
          }

          var $this = $(this);
          morlock.onResize(function(d) {
            $this.trigger('morlockResize', d);
          });
          morlock.onResizeEnd(function(d) {
            $this.trigger('morlockResizeEnd', d);
          });
        });
      };

      $.fn.morlockScroll = function() {
        return $(this).each(function() {
          if (this !== window) {
            // console.log('must attach event to window', this);
            return;
          }

          var $this = $(this);
          morlock.onScroll(function() {
            $this.trigger('morlockScroll');
          });
          morlock.onScrollEnd(function() {
            $this.trigger('morlockScrollEnd');
          });
        });
      };

      $.fn.morlockElementPosition = function(position) {
        return $(this).each(function() {
          if (this !== window) {
            // console.log('must attach event to window', this);
            return;
          }

          var $this = $(this);
          morlock.position.before(position, function() {
            $this.trigger('morlockElementPositionBefore', position);
          });
          morlock.position.after(position, function() {
            $this.trigger('morlockElementPositionAfter', position);
          });
        });
      };

      $.fn.morlockBreakpoint = function(options) {
        return $(this).each(function() {
          if (this !== window) {
            // console.log('must attach event to window', this);
            return;
          }

          var $this = $(this);
          var controller = new BreakpointController(options);
          controller.on('breakpoint', function(e) {
            $this.trigger('morlockBreakpoint', e);
          });
        });
      };

      $.fn.morlockElementVisible = function(options) {
        return $(this).each(function() {
          var $this = $(this);
          
          var observer = morlock.observeElement(this, options);

          observer.on('enter', function() {
            $this.trigger('morlockElementVisibleEnter');
          });
          observer.on('exit', function() {
            $this.trigger('morlockElementVisibleExit');
          });
        });
      };
    }

    var morlock = {
      onResize: function onResize(cb) {
        var st = getResizeTracker();
        return st.on('resize', cb);
      },

      onResizeEnd: function onResizeEnd(cb) {
        var st = getResizeTracker();
        return st.on('resizeEnd', cb);
      },

      onScroll: function onScroll(cb) {
        var st = getScrollTracker();
        return st.on('scroll', cb);
      },

      onScrollEnd: function onScrollEnd(cb) {
        var st = getScrollTracker();
        return st.on('scrollEnd', cb);
      },

      observeElement: function observeElement(elem, options) {
        return new ElementVisibleController(elem, options);
      },

      observePosition: function observePosition(positionY) {
        return new ScrollPositionController(positionY);
      },

      breakpoint: {
        enter: function(def, cb) {
          var controller = getBreakpointTracker({
            breakpoints: {
              singleton: def
            }
          });

          controller.on('breakpoint:singleton', function(data) {
            if (data[1] === 'enter') {
              cb(data);
            }
          });
        },

        exit: function(def, cb) {
          var controller = getBreakpointTracker({
            breakpoints: {
              singleton: def
            }
          });

          controller.on('breakpoint:singleton', function(data) {
            if (data[1] === 'exit') {
              cb(data);
            }
          });
        }
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
      },

      enableJQuery: function($) {
        $ || ($ = jQuery);

        if (!$) { return; }

        defineJQueryPlugins($);
      }
    };
    __exports__.morlock = morlock;
    morlock.Stream = Stream;
    morlock.Events = Events;
    morlock.Buffer = Buffer;
    morlock.Util = Util;

    __exports__.ResizeController = ResizeController;
    __exports__.BreakpointController = BreakpointController;
    __exports__.ResponsiveImage = ResponsiveImage;
    __exports__.ScrollController = ScrollController;
    __exports__.ElementVisibleController = ElementVisibleController;
    __exports__.ScrollPositionController = ScrollPositionController;
  });
require(["morlock/base"]);
  //The modules for your project will be inlined above
  //this snippet. Ask almond to synchronously require the
  //module value for 'main' here and return it as the
  //value to use for the public API for the built file.
  return require('morlock/base');
}));